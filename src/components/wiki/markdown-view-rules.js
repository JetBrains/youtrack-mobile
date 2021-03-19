/* @flow */

import React from 'react';
import {Image, ScrollView, Text, View, Linking} from 'react-native';

import Hyperlink from 'react-native-hyperlink';
import UrlParse from 'url-parse';

import calculateAspectRatio from '../aspect-ratio/aspect-ratio';
import LongText from './text-renderer';
import renderCode from './code-renderer';
import Router from '../router/router';
import {getApi} from '../api/api__instance';
import {guid} from '../../util/util';
import {hasMimeType} from '../mime-type/mime-type';
import {ResourceTypes} from '../api/api__resource-types';

import styles from './youtrack-wiki.styles';

import type {Article} from '../../flow/Article';
import type {Attachment, ImageDimensions, IssueProject} from '../../flow/CustomFields';
import type {Folder} from '../../flow/User';
import type {IssueFull} from '../../flow/Issue';
import type {MarkdownNode} from '../../flow/Markdown';
import type {UITheme} from '../../flow/Theme';

export type Mentions = {
  articles: Array<Article>,
  issues: Array<IssueFull>
}

type TextData = {
  text: string,
  type: null | number | typeof ResourceTypes.ARTICLE | typeof ResourceTypes.ISSUE
};


function getMarkdownRules(
  attachments: Array<Attachment> = [],
  projects: Array<IssueProject> = [],
  uiTheme: UITheme,
  mentions?: Mentions
): Object {

  const imageHeaders = getApi().auth.getAuthorizationHeaders();
  const projectIds = (projects).map((it: Folder) => it?.shortName).join('|');
  const issueId = new RegExp(`\\b(?:${projectIds})\\b-\\d+$`);
  const imageEmbedRegExp = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;

  const markdownImage = ({key, uri, alt, imageDimensions}) => {
    const dimensions: ImageDimensions = calculateAspectRatio(
      imageDimensions ||
      {width: 250, height: 300}
    );

    const imageProps: Object = {
      key,
      style: dimensions,
      source: {uri, headers: imageHeaders},
    };

    if (alt) {
      imageProps.accessible = true;
      imageProps.accessibilityLabel = alt;
    }

    return <Image {...imageProps} />;
  };

  return {

    blockquote: (node: MarkdownNode, children: Object) => (
      <View key={node.key} style={styles.blockQuote}>
        {children}
      </View>
    ),

    image: (node: MarkdownNode) => {
      const {src = '', alt} = node.attributes;
      const targetAttach: ?Attachment = attachments.find((it: Attachment) => it.name && it.name.includes(src));

      const parsedURL = UrlParse(src);
      const url: ?string = parsedURL?.protocol && parsedURL?.origin ? src : targetAttach?.url;
      if (!url || hasMimeType.svg(targetAttach)) {
        return null;
      }

      return markdownImage({
        key: node.key,
        uri: url,
        alt: alt,
        imageDimensions: targetAttach?.imageDimensions,
      });
    },

    code_inline: (node: MarkdownNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      return (
        <Text key={node.key} style={[inheritedStyles, styles.inlineCode]}>
          {node.content}
        </Text>
      );
    },

    fence: (node: MarkdownNode) => {
      let content = node.content;

      if (
        typeof node.content === 'string' &&
        node.content.charAt(node.content.length - 1) === '\n'
      ) {
        content = node.content.substring(0, node.content.length - 1);
      }

      const language: string = node.sourceInfo;
      const isStacktraceOrException: boolean = !!language && ['exception', 'stacktrace'].includes(language);

      return (
        <View key={node.key} style={styles.codeContainer}>
          {!!language && !isStacktraceOrException && <Text style={styles.codeLanguage}>{language}</Text>}

          {<ScrollView
            scrollEventThrottle={100}
            style={styles.codeContent}
          >
            <ScrollView
              horizontal={true}
              scrollEventThrottle={100}
            >
              {isStacktraceOrException && <LongText style={styles.exception}>{content}</LongText>}
              {!isStacktraceOrException && <Text key={node.key}>{renderCode({content}, language, uiTheme)}</Text>}
            </ScrollView>
          </ScrollView>}
        </View>
      );
    },

    link: (node: MarkdownNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      const child: ?Object = node?.children[0];
      const content: string = (child && child.content) || children;
      return (
        <Text
          key={node.key}
          style={[inheritedStyles, style.text, styles.link]}
          onPress={() => Linking.openURL(node.attributes.href)}
        >
          {content}
        </Text>
      );
    },

    text: (node: MarkdownNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      const text: string = node.content;

      if (mentions && mentions.articles.concat(mentions.issues).length > 0) {
        return renderArticleMentions(node, mentions, uiTheme, style, inheritedStyles);
      }

      if (node.content.match(imageEmbedRegExp)) {
        const attach: Attachment = attachments.find((it: Attachment) => it.name && text.includes(it.name));
        if (attach && attach.url && hasMimeType.image(attach)) {
          return markdownImage({
            key: node.key,
            uri: attach.url,
            alt: node?.attributes?.alt,
            imageDimensions: attach.imageDimensions,
          });
        }
      }

      if (issueId.test(text)) {
        return (
          <Text
            key={node.key}
            onPress={() => Router.Issue({issueId: text})}
            style={[inheritedStyles, style.text, styles.link]}>
            {text}
          </Text>
        );
      }

      return (
        <Hyperlink
          key={node.key}
          linkStyle={style.link}
          linkDefault={true}>
          <Text style={[inheritedStyles, style.text]}>
            {text}
          </Text>
        </Hyperlink>
      );
    },
  };
}

export default getMarkdownRules;

function createMentionRegExp(mention: string) {
  const punctuationMarks = ['.', ',', '!', ':', '\\-'].join('');
  const prefix = `(?:[\\s${punctuationMarks}([]|^)`;
  const suffix = `(?=[\\s${punctuationMarks})\\]]|$)`;
  return new RegExp(`${prefix}${mention}${suffix}`, 'ig');
}

function renderArticleMentions(
  node: MarkdownNode,
  mentions: Mentions,
  uiTheme: UITheme,
  style: Object,
  inheritedStyles: Object,
) {
  const PLAIN_TEXT_TYPE: string = '-=TEXT=-';
  const textData: Array<TextData> = [];
  const tokens: Array<string> = node.content.split(' ');
  const combinedMentions: Array<Article | IssueFull> = mentions.articles.concat(mentions.issues);

  parseNodeContent:
  for (let i = 0; i < tokens.length; i++) {
    const token: string = tokens[i];
    const tokenTextData: TextData = {
      text: token,
      type: null,
    };

    for (let j = 0; j < combinedMentions.length; j++) {
      const entity: Article | IssueFull = combinedMentions[j];
      if (!createMentionRegExp(entity.idReadable).test(token)) {
        continue;
      }
      if (token === entity.idReadable) {
        textData.push({
          text: entity.idReadable,
          type: entity.$type,
        });
      } else {
        token.split(entity.idReadable).forEach((str: string) => {
          textData.push({
            text: str ? str : entity.idReadable,
            type: str ? PLAIN_TEXT_TYPE : entity.$type,
          });
        });
      }
      continue parseNodeContent;
    }

    if (!tokenTextData.type) {
      tokenTextData.type = PLAIN_TEXT_TYPE;
      textData.push(tokenTextData);
    }
  }

  if (textData.length > 0) {
    let index: number = -1;
    let textTokensToJoin: Array<string> = [];
    const composed: Array<React$Element<any>> = [];

    while (index < textData.length - 1) {
      index++;
      const td: TextData = textData[index];

      if (td.type === PLAIN_TEXT_TYPE) {
        textTokensToJoin.push(td.text);
        continue;
      }

      if (td.type !== PLAIN_TEXT_TYPE) {
        composed.push(
          <Text key={guid()}>
            {textTokensToJoin.length > 0 && <Text style={style.text}>{`${textTokensToJoin.join(' ')} `}</Text>}
            <Text
              style={{color: uiTheme.colors.$link}}
              onPress={
                () => (
                  td.type === ResourceTypes.ARTICLE
                    ? Router.Article({articlePlaceholder: {idReadable: td.text}, storePrevArticle: true})
                    : Router.Issue({issueId: td.text})
                )}
            >{td.text}</Text>
          </Text>
        );
        textTokensToJoin = [];
      }
    }

    if (textTokensToJoin.length > 0) {
      composed.push(
        <Text
          style={[inheritedStyles, style.text]}
          key={guid()}
        >{textTokensToJoin.join(' ')}
        </Text>
      );
    }

    return <Text key={node.key}>{composed}</Text>;
  }

}
