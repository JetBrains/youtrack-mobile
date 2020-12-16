/* @flow */
import React from 'react';

import {Image, ScrollView, Text, View} from 'react-native';

import calculateAspectRatio from '../aspect-ratio/aspect-ratio';
import LongText from './text-renderer';
import renderCode from './code-renderer';
import Router from '../router/router';
import {getApi} from '../api/api__instance';
import {guid} from '../../util/util';
import {hasMimeType} from '../mime-type/mime-type';
import {hasType} from '../api/api__resource-types';

import styles from './youtrack-wiki.styles';

import type {Attachment, ImageDimensions, IssueProject} from '../../flow/CustomFields';
import type {Folder} from '../../flow/User';
import type {UITheme} from '../../flow/Theme';
import type {Article} from '../../flow/Article';
import type {IssueFull} from '../../flow/Issue';


function getMarkdownRules(
  attachments: Array<Attachment> = [],
  projects: Array<IssueProject> = [],
  uiTheme: UITheme,
  mentions?: { articles: Array<string>, issues: Array<string> }
) {

  const imageHeaders = getApi().auth.getAuthorizationHeaders();
  const projectIds = (projects).map((it: Folder) => it?.shortName).join('|');
  const issueId = new RegExp(`\\b(?:${projectIds})\\b-\\d+$`);

  return {

    blockquote: (node: Object, children: Object) => (
      <View key={node.key} style={styles.blockQuote}>
        {children}
      </View>
    ),

    image: (node: Object) => {
      const {src, alt} = node.attributes;
      const targetAttach: ?Attachment = attachments.find(it => it.name === src);

      if (!targetAttach || !targetAttach.url || hasMimeType.svg(targetAttach)) {
        return null;
      }

      const source = Object.assign({uri: targetAttach.url, headers: imageHeaders}, targetAttach);
      const dimensions: ImageDimensions = calculateAspectRatio(
        targetAttach.imageDimensions ||
        {width: 250, height: 300}
      );

      const imageProps: Object = {
        key: node.key,
        style: {
          ...dimensions
        },
        source
      };

      if (alt) {
        imageProps.accessible = true;
        imageProps.accessibilityLabel = alt;
      }

      return <Image {...imageProps} />;
    },

    code_inline: (node: Object, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      return (
        <Text key={node.key} style={[inheritedStyles, styles.inlineCode]}>
          {` ${node.content} `}
        </Text>
      );
    },

    fence: (node: Object) => {
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

    text: (node: Object, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      const text: string = node.content;
      const combinedMentions: ?Array<Article | IssueFull> = mentions && mentions.articles.concat(mentions.issues);

      if (combinedMentions && combinedMentions.length > 0) {
        return renderArticleMentions(node, combinedMentions, uiTheme);
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
        <Text
          key={node.key}
          style={[inheritedStyles, style.text]}
        >
          {text}
        </Text>
      );
    }
  };
}

export default getMarkdownRules;

function createMentionRegExp(mention: string) {
  const punctuationMarks = ['.', ',', '!', ':', '\\-'].join('');
  const prefix = `(?:[\\s${punctuationMarks}([]|^)`;
  const suffix = `(?=[\\s${punctuationMarks})\\]]|$)`;
  return new RegExp(`${prefix}${mention}${suffix}`, 'ig');
}

function renderArticleMentions(node, combinedMentions, uiTheme: UITheme) {
  const tokens: Array<string> = node.content.split(' ');
  const textData: Array<{ text: string, type: 0 | 1 | 2 }> = [];

  parseTokens:
  for (let i = 0; i < tokens.length; i++) {
    const token: string = tokens[i];
    const current = {
      text: token,
      type: null
    };

    for (let j = 0; j < combinedMentions.length; j++) {
      const entity: Article | IssueFull = combinedMentions[j];
      if (createMentionRegExp(entity.idReadable).test(token)) {
        const type: number = hasType.article(entity) ? 1 : 2;
        if (token === entity.idReadable) {
          textData.push({
            text: entity.idReadable,
            $type: entity.$type,
            type: type
          });
        } else {
          token.split(entity.idReadable).forEach((str: string) => {
            if (str) {
              textData.push({
                text: str,
                type: 0
              });
            } else {
              textData.push({
                text: entity.idReadable,
                $type: entity.$type,
                type: type
              });
            }
          });
        }
        continue parseTokens;
      }
    }

    if (!current.type) {
      current.type = 0;
      textData.push(current);
    }
  }

  if (textData.length > 0) {
    let index = -1;
    let text = [];
    const composed = [];
    while (index < textData.length - 1) {
      index++;
      const item = textData[index];
      const type = item.type;
      if (type === 0) {
        text.push(item.text);
        continue;
      }
      if (type === 1 || type === 2) {
        composed.push(
          <Text key={guid()}>
            {text.length > 0 && <Text>{`${text.join(' ')} `}</Text>}
            <Text style={{color: uiTheme.colors.$link}} onPress={
              () => (
                type === 1
                  ? Router.Article({placeholder: {id: item.text}})
                  : Router.Issue({issueId: item.text})
              )}
            >{item.text}</Text>
          </Text>
        );
        text = [];
      }
    }

    if (text.length) {
      composed.push(
        <Text key={guid()}>{text.join(' ')}</Text>
      );
    }

    return <Text key={node.key}>{composed}</Text>;
  }

}
