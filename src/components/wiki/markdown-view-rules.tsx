import React from 'react';
import {
  Linking,
  Text,
  View,
} from 'react-native';

import Hyperlink from 'react-native-hyperlink';
// @ts-ignore
import renderRules from 'react-native-markdown-display/src/lib/renderRules';
import UrlParse from 'url-parse';

import CodeHighlighter from './code-renderer';
import HTML from './renderers/renderer__html';
import MarkdownMention from 'components/wiki/markdown/markdown-mention';
import renderArticleMentions from './renderers/renderer__article-mentions';
import Router from 'components/router/router';
import {guid, isURLPattern} from 'util/util';
import {hasMimeType} from 'components/mime-type/mime-type';
import {IconCheckboxBlank, IconCheckboxChecked} from 'components/icon/icon';
import {isMarkdownNodeContainsCheckbox} from 'components/wiki/markdown-helper';
import {MarkdownEmbedLink} from 'components/wiki/markdown';
import {whiteSpacesRegex} from './util/patterns';

import styles from './youtrack-wiki.styles';

import type {Article} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import type {IssueFull} from 'types/Issue';
import type {MarkdownNode} from 'types/Markdown';
import type {TextStyleProp} from 'types/Internal';
import type {UITheme} from 'types/Theme';

export type Mentions = {
  articles: Article[];
  issues: IssueFull[];
};
const issueIdRegExp: RegExp = /([a-zA-Z]+-)+\d+/g;
const imageEmbedRegExp: RegExp = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
const imageRegExp: RegExp = /<img [^>]*src=(["“'])[^"]*(["”'])[^>]*>/i;
const imageWidth: RegExp = /{width=\d+(%|px)?}/i;
const imageHeight: RegExp = /{height=\d+(%|px)?}/i;
const htmlTagRegex = /(<([^>]+)>)/gi;
const googleCalendarURL: RegExp = /^http(s?):\/\/calendar.google.([a-z]{2,})\/calendar/i;
const googleDocsURL: RegExp = /^http(s?):\/\/docs.google.([a-z]{2,})\/document/i;
const figmaURL: RegExp = /^http(s?):\/\/(www\.)?figma.com/i;


function getMarkdownRules(
  attachments: Attachment[] = [],
  uiTheme: UITheme,
  mentions?: Mentions,
  onCheckboxUpdate?: (checked: boolean, position: number) => void,
  textStyle: TextStyleProp = {},
): Record<string, any> {

  const renderHyperLink = (linkText: string, style: any): React.ReactNode => (
    <Hyperlink key={guid()} linkStyle={style.link} linkDefault={true} linkText={linkText}/>
  );

  const textRenderer = (
    node: MarkdownNode,
    children: Record<string, any>,
    parent: Record<string, any>,
    style: Record<string, any>,
    inheritedStyles: Record<string, any> = {},
  ): any => {
    const baseTextStyle = [inheritedStyles, style.text];
    const text: string = node.content
      .replace(imageHeight, '')
      .replace(imageWidth, '')
      .replace(whiteSpacesRegex, ' ')
      .replace(htmlTagRegex, ' ');

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

      return renderHyperLink(text, [
        baseTextStyle,
        styles.link,
      ]);
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

  return {
    blockquote: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => (
      <View key={node.key} style={[inheritedStyles, style.blockquote]}>
        {children}
      </View>
    ),
    image: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      const {src = '', alt} = node.attributes;
      const targetAttach: Attachment | null | undefined = attachments.find(
        (it: Attachment) => it.name && it.name.includes(src),
      );
      const parsedURL = UrlParse(src);
      const url: string | null | undefined =
        parsedURL?.protocol && parsedURL?.origin ? src : targetAttach?.url;

      if (!url || hasMimeType.svg(targetAttach)) {
        return null;
      }

      if (isGoogleShared(url) || isFigmaImage(url)) {
        return renderHyperLink(url, [inheritedStyles, style.link]);
      }

      return <MarkdownEmbedLink
        uri={url}
        alt={alt}
        imageDimensions={targetAttach?.imageDimensions}
      />;
    },
    code_inline: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return (
        <Text
          selectable={true}
          key={node.key}
          style={[inheritedStyles, styles.inlineCode]}
        >
          {node.content}
        </Text>
      );
    },
    fence: (node: MarkdownNode) => (
      <CodeHighlighter key={node.key} node={node} uiTheme={uiTheme} />
    ),
    link: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      const child: Record<string, any> | null | undefined = node?.children[0];
      let content: string = (child && child.content) || children;

      if (imageRegExp.test(content)) {
        return null; //do not render image HTML markup in a link
      }

      if (content.replace && !content.replace(htmlTagRegex, '')) {
        content = node.children
          .map(it => it.content)
          .join('')
          .replace(htmlTagRegex, '');
      }

      return (
        <Text
          selectable={true}
          key={node.key}
          style={[inheritedStyles, textStyle, style.text, styles.link]}
          onPress={() => Linking.openURL(node.attributes.href)}
        >
          {content}
        </Text>
      );
    },
    list_item: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      const hasCheckbox: boolean = isMarkdownNodeContainsCheckbox(node);
      return renderRules.list_item(
        node,
        children,
        parent,
        hasCheckbox
          ? {
              ...style,
              bullet_list_icon: {
                ...style.bullet_list_icon,
                ...style.bullet_list_icon_checkbox,
              },
            }
          : style,
        inheritedStyles
      );
    },
    inline: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return isMarkdownNodeContainsCheckbox(node) ? (
        <View
          key={node.key}
          style={[inheritedStyles, style.inline, styles.checkboxRow]}
        >
          {children}
        </View>
      ) : (
        renderRules.inline(node, children, parent, style, inheritedStyles)
      );
    },
    textgroup: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return isMarkdownNodeContainsCheckbox(node) ? (
        <View
          key={node.key}
          style={[inheritedStyles, style.textgroup, styles.checkboxTextGroup]}
        >
          {children}
        </View>
      ) : (
        renderRules.textgroup(
          node,
          children,
          parent,
          style,
          inheritedStyles,
          textStyle,
        )
      );
    },
    checkbox: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      const isChecked: boolean = node.attributes.checked === true;
      const position: number = node.attributes.position;
      const CheckboxIcon: Record<string, any> = isChecked
        ? IconCheckboxChecked
        : IconCheckboxBlank;
      const text: string = node.content.trim();
      const onPress = () => onCheckboxUpdate?.(!isChecked, position);
      return (
        <>
          <Text
            onPress={onPress}
            style={styles.checkboxIconContainer}
          >
            <CheckboxIcon
              size={24}
              style={[
                styles.checkboxIcon,
                !isChecked && styles.checkboxIconBlank,
              ]}
            />
          </Text>
          <Text
            key={node.key}
            style={[inheritedStyles, styles.checkboxRow]}
            onPress={onPress}
          >
            <Text
              selectable={true}
              style={[
                inheritedStyles,
                style.text,
                textStyle,
              ]}
            >
              {issueIdRegExp.test(text)
                ? <MarkdownMention
                  mention={text}
                  onPress={() => Router.Issue({issueId: text.trim()})}
                  style={[inheritedStyles, style.text, styles.link]}
                />
                : text}
              {' '}
            </Text>
          </Text>
        </>
      );
    },
    text: textRenderer,
    s: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return isMarkdownNodeContainsCheckbox(node) ? (
        <View key={node.key} style={[inheritedStyles, style.textgroup]}>
          {children}
        </View>
      ) : (
        renderRules.s(node, children, parent, style, inheritedStyles, textStyle)
      );
    },
    html_block: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      if (isHTMLLinebreak(node.content)) {
        return renderHTMLLinebreak(node, children, parent, style);
      }

      return <HTML html={node.content} />;
    },
    html_inline: (
      node: MarkdownNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      if (isHTMLLinebreak(node.content)) {
        return renderHTMLLinebreak(
          node,
          children,
          parent,
          style,
          inheritedStyles,
        );
      }

      return textRenderer(node, children, parent, style);
    },
  };
}

export default getMarkdownRules;

function isFigmaImage(url: string = ''): boolean {
  return figmaURL.test(url);
}

function isGoogleShared(url: string = ''): boolean {
  return googleCalendarURL.test(url) || googleDocsURL.test(url);
}

function isHTMLLinebreak(text: string): boolean {
  return ['<br>', '<br/>'].some(
    (tagName: string) => tagName === text.toLowerCase(),
  );
}

function renderHTMLLinebreak(
  node: MarkdownNode,
  children: Record<string, any>,
  parent: Record<string, any>,
  style: Record<string, any>,
) {
  return renderRules.softbreak(node, children, parent, style);
}
