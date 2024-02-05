import React from 'react';
import {
  Text,
  View,
} from 'react-native';

// @ts-ignore
import renderRules from 'react-native-markdown-display/src/lib/renderRules';
import UrlParse from 'url-parse';

import HTML from './markdown/markdown-html';
import MarkdownHyperLink from 'components/wiki/markdown/markdown-hyper-link';
import {hasMimeType} from 'components/mime-type/mime-type';
import {IconCheckboxBlank, IconCheckboxChecked} from 'components/icon/icon';
import {isMarkdownNodeContainsCheckbox} from 'components/wiki/markdown-helper';
import {MarkdownCodeHighlighter, MarkdownEmbedLink, MarkdownText} from 'components/wiki/markdown';

import styles from './youtrack-wiki.styles';

import type {Article} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import type {AnyIssue} from 'types/Issue';
import type {MarkdownNode} from 'types/Markdown';
import type {TextStyleProp} from 'types/Internal';
import type {UITheme} from 'types/Theme';
import {User} from 'types/User';


export type Mention = Article | AnyIssue | User;
export type Mentions = {
  articles: Article[];
  issues: AnyIssue[];
  users: User[];
};
const imageRegExp: RegExp = /<img [^>]*src=(["“'])[^"]*(["”'])[^>]*>/i;
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

  return {
    blockquote: (
      node: MarkdownNode,
      children: React.ReactElement,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => (
      <View key={node.key} style={style.blockquote}>
        <Text style={[inheritedStyles, style.blockquoteText]}>{children}</Text>
      </View>
    ),
    image: (
      node: MarkdownNode,
      children: React.ReactElement,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      const {src = '', alt} = node.attributes;
      const targetAttach: Attachment | null | undefined = attachments.find(
        (it: Attachment) => it.name && it.name.includes(src),
      );
      const parsedURL = UrlParse(src);
      const url: string | null | undefined = parsedURL?.protocol && parsedURL?.origin ? src : targetAttach?.url;

      if (!url || hasMimeType.svg(targetAttach)) {
        return null;
      }

      if (isGoogleShared(url) || isFigmaImage(url)) {
        return (
          <MarkdownHyperLink
            uri={url}
            style={[inheritedStyles, textStyle, style.text]}
          />
        );
      }

      return <MarkdownEmbedLink
        key={node.key}
        uri={url}
        alt={alt}
        imageDimensions={targetAttach?.imageDimensions}
      />;
    },
    code_inline: (
      node: MarkdownNode,
      children: React.ReactElement,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return (
        <Text
          key={node.key}
          selectable={true}
          style={[inheritedStyles, styles.inlineCode]}
        >
          {node.content}
        </Text>
      );
    },
    fence: (node: MarkdownNode) => (
      <MarkdownCodeHighlighter key={node.key} node={node} uiTheme={uiTheme} />
    ),
    link: (
      node: MarkdownNode,
      children: React.ReactElement,
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
        <MarkdownHyperLink
          uri={node.attributes.href}
          style={[inheritedStyles, textStyle, style.text]}>
          {content}
        </MarkdownHyperLink>
      );
    },
    list_item: (
      node: MarkdownNode,
      children: React.ReactElement,
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
      children: React.ReactElement,
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
      children: React.ReactElement,
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
      children: React.ReactElement,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      const isChecked: boolean = node.attributes.checked === true;
      const position: number = node.attributes.position;
      const CheckboxIcon = isChecked ? IconCheckboxChecked : IconCheckboxBlank;
      const onPress = () => onCheckboxUpdate?.(!isChecked, position);
      return (
        <React.Fragment key={node.key}>
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
          <MarkdownText
            attachments={attachments}
            key={node.key}
            mentions={mentions}
            node={node}
            style={[textStyle, inheritedStyles, styles.checkboxRow]}
            uiTheme={uiTheme}
          />
        </React.Fragment>
      );
    },
    text: (
      node: MarkdownNode,
      children: React.ReactElement,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return <MarkdownText
        key={node.key}
        attachments={attachments}
        mentions={mentions}
        node={node}
        style={[inheritedStyles, style.text]}
        uiTheme={uiTheme}
      />;
    },
    s: (
      node: MarkdownNode,
      children: React.ReactElement,
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
      children: React.ReactElement,
      parent: Record<string, any>,
      style: Record<string, any>,
    ) => {
      if (isHTMLLinebreak(node.content)) {
        return renderHTMLLinebreak(node, children, parent, style);
      }

      return <HTML key={node.key} html={node.content} />;
    },
    html_inline: (
      node: MarkdownNode,
      children: React.ReactElement,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      const _style = {...inheritedStyles, ...style};
      if (isHTMLLinebreak(node.content)) {
        return renderHTMLLinebreak(
          node,
          children,
          parent,
          _style,
        );
      }
      return <MarkdownText
        key={node.key}
        attachments={attachments}
        mentions={mentions}
        node={node}
        style={_style}
        uiTheme={uiTheme}
      />;
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
  children: React.ReactElement,
  parent: Record<string, any>,
  style: Record<string, any>,
) {
  return renderRules.softbreak(node, children, parent, style);
}
