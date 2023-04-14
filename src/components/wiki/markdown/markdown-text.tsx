import React from 'react';
import {Text, TextStyle} from 'react-native';

import Hyperlink from 'react-native-hyperlink';

import MarkdownMention from 'components/wiki/markdown/markdown-mention';
import renderArticleMentions from 'components/wiki/renderers/renderer__article-mentions';
import Router from 'components/router/router';
import {guid, isURLPattern} from 'util/util';
import {hasMimeType} from 'components/mime-type/mime-type';
import {MarkdownEmbedLink} from 'components/wiki/markdown/index';
import {Mentions} from 'components/wiki/markdown-view-rules';
import {whiteSpacesRegex} from 'components/wiki/util/patterns';

import styles from 'components/wiki/youtrack-wiki.styles';

import {Attachment} from 'types/CustomFields';
import {MarkdownNode} from 'types/Markdown';
import {UITheme} from 'types/Theme';


const htmlTagRegex = /(<([^>]+)>)/gi;
const imageEmbedRegExp: RegExp = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
const imageHeight: RegExp = /{height=\d+(%|px)?}/i;
const imageWidth: RegExp = /{width=\d+(%|px)?}/i;
const issueIdRegExp: RegExp = /([a-zA-Z]+-)+\d+/g;
const renderHyperLink = (linkText: string, style: TextStyle | TextStyle[]) => (
  <Hyperlink
    key={guid()}
    linkDefault={true}
    linkStyle={[styles.link, ...(Array.isArray(style) ? style : [style])]}
    linkText={linkText}
  />
);


const MarkdownText = ({
  node,
  style,
  inheritedStyles,
  attachments,
  mentions,
  uiTheme,
}: {
  node: MarkdownNode,
  style: Record<string, any>,
  inheritedStyles: Record<string, any>,
  attachments: Attachment[],
  mentions: Mentions | undefined,
  uiTheme: UITheme,
}): JSX.Element | null => {

  const baseTextStyle: TextStyle[] = [inheritedStyles, style.text];
  const text: string = (
    node.content
      .replace(imageHeight, '')
      .replace(imageWidth, '')
      .replace(whiteSpacesRegex, ' ')
      .replace(htmlTagRegex, ' ')
  );

  if (!text) {
    return null;
  }

  if ((mentions?.articles || []).length > 0 || (mentions?.issues || []).length > 0) {
    return renderArticleMentions(
      node,
      (mentions as Mentions),
      uiTheme,
      style,
      inheritedStyles,
    );
  }

  if (text.match(imageEmbedRegExp)) {
    const attach: Attachment | null | undefined = attachments.find(
      (it: Attachment) => it.name && text.includes(it.name),
    );

    if (attach && attach.url && hasMimeType.image(attach)) {
      return <MarkdownEmbedLink
        uri={attach.url}
        alt={node?.attributes?.alt}
        imageDimensions={attach.imageDimensions}
      />;
    }
  }

  if (issueIdRegExp.test(text) && !isURLPattern(text)) {
    const matched: RegExpMatchArray | null = text.match(issueIdRegExp);

    if (matched && matched[0]) {
      const matchedIndex: number = text.search(matched[0]);
      return (
        <Text
          selectable={true}
          key={node.key}
          style={baseTextStyle}
        >
          {renderHyperLink(text.slice(0, matchedIndex), baseTextStyle)}
          <MarkdownMention
            mention={matched[0]}
            onPress={() => Router.Issue({issueId: matched[0].trim()})}
            style={[...baseTextStyle, styles.link]}
          />
          {renderHyperLink(
            text.slice(matchedIndex + matched[0].length, text.length),
            baseTextStyle,
          )}
        </Text>
      );
    }

    return renderHyperLink(text, baseTextStyle);
  }

  return (
    <Text
      key={node.key}
      style={baseTextStyle}
    >
      {text}
    </Text>
  );
};


export default React.memo(MarkdownText);
