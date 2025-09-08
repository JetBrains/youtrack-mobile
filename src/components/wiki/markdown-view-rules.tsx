import React from 'react';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

// @ts-ignore
import renderRules from 'react-native-markdown-display/src/lib/renderRules';
import UrlParse from 'url-parse';

import FileMedia from 'components/attach-file/file-media';
import HTML from './markdown/markdown-html';
import MarkdownCheckbox from 'components/wiki/markdown/markdown-checkbox';
import MarkdownHyperLink from 'components/wiki/markdown/markdown-hyper-link';
import {baseMarkdownStyles} from 'components/wiki/markdown-view-styles';
import {hasMimeType} from 'components/mime-type/mime-type';
import {isMarkdownNodeContainsCheckbox} from 'components/wiki/markdown-helper';
import {MarkdownCodeHighlighter, MarkdownEmbedLink, MarkdownText} from 'components/wiki/markdown';

import styles from './youtrack-wiki.styles';

import type {AnyIssue} from 'types/Issue';
import type {Article} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import type {MarkdownNode} from 'types/Markdown';
import type {TextStyleProp} from 'types/Internal';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';

export type Mention = Article | AnyIssue | User;
export type Mentions = {
  articles: Article[];
  issues: AnyIssue[];
  users: User[];
};
const imageRegExp: RegExp = /<img [^>]*src=(["“'])[^"]*(["”'])[^>]*>/i;
const htmlTagRegex = /(<([^>]+)>)/gi;
const mp4Regex = /\.mp4$/i;

const googleCalendarURL: RegExp = /^http(s?):\/\/calendar.google.([a-z]{2,})\/calendar/i;
const googleDocsURL: RegExp = /^http(s?):\/\/docs.google.([a-z]{2,})\/document/i;
const figmaURL: RegExp = /^http(s?):\/\/(www\.)?figma.com/i;
const appDiagramsURL: RegExp = /^http(s?):\/\/(www\.)?app.diagrams.net/i;
const viewerDiagramsURL: RegExp = /^http(s?):\/\/(www\.)?viewer.diagrams.net/i;
const miroURL: RegExp = /^http(s?):\/\/(www\.)?miro.com/i;


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
      children: React.ReactElement[] | string,
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
    ) => (
      <View key={node.key} style={style.blockquote}>
        {typeof children === 'string' ? (
          <Text style={[inheritedStyles, style.blockquoteText]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    ),
    image: (
      node: MarkdownNode,
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
    ) => {
      const {src = '', alt} = node.attributes;
      const targetAttach: Attachment | undefined = attachments.find(
        (it: Attachment) => it.name && it.name.includes(src),
      );
      const parsedURL = UrlParse(src);
      const url: string | null | undefined = parsedURL?.protocol && parsedURL?.origin ? src : targetAttach?.url;

      if (!url || (targetAttach && hasMimeType.svg(targetAttach))) {
        return null;
      }

      if (isEmbedContent(url)) {
        return (
          <MarkdownHyperLink
            uri={url}
            style={[inheritedStyles, textStyle, style.text]}
          />
        );
      }

      if (mp4Regex.test(src)) {
        return <FileMedia file={{url}} />;
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
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
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
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
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
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
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
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
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
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
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
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
      enabled: boolean = true,
    ) => {
      const isInTable = parent.some(i => i.type === 'table');
      return (
        <MarkdownCheckbox
          enabled={enabled && !isInTable}
          key={node.key}
          onCheckboxUpdate={onCheckboxUpdate}
          position={node.attributes.position}
          checked={node.attributes.checked === true}
        >
          <MarkdownText
            attachments={attachments}
            mentions={mentions}
            node={node}
            style={[textStyle, inheritedStyles, styles.checkboxRow]}
            uiTheme={uiTheme}
          />
        </MarkdownCheckbox>
      );
    },
    text: (
      node: MarkdownNode,
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
    ) => {
      return <MarkdownText
        key={node.key}
        attachments={attachments}
        mentions={mentions}
        node={node}
        style={[inheritedStyles, style.text, textStyle]}
        uiTheme={uiTheme}
      />;
    },
    s: (
      node: MarkdownNode,
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
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
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
    ) => {
      if (isHTMLLinebreak(node.content)) {
        return renderHTMLLinebreak(node, children, parent, style);
      }

      return <HTML key={node.key} html={node.content} />;
    },
    html_inline: (
      node: MarkdownNode,
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles: TextStyleProp = {},
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
    table: (
      node: MarkdownNode,
      children: React.ReactElement[],
      parent: MarkdownNode[],
      style: typeof baseMarkdownStyles,
      inheritedStyles = {},
    ) => {
      return (
        <ScrollView
          key={node.key}
          horizontal={true}
        >
          <TouchableWithoutFeedback>
            <View style={[style.table, inheritedStyles]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      );
    },
  };
}

export default getMarkdownRules;

function isFigma(url: string = ''): boolean {
  return figmaURL.test(url);
}

function isGoogleEmbed(url: string = ''): boolean {
  return googleCalendarURL.test(url) || googleDocsURL.test(url);
}

function isDiagram(url: string = ''): boolean {
  return appDiagramsURL.test(url) || viewerDiagramsURL.test(url);
}

function isMiro(url: string = ''): boolean {
  return miroURL.test(url) || viewerDiagramsURL.test(url);
}

function isEmbedContent(url: string = ''): boolean {
  return isFigma(url) || isGoogleEmbed(url) || isDiagram(url) || isMiro(url);
}

function isHTMLLinebreak(text: string): boolean {
  return ['<br>', '<br/>'].some(
    (tagName: string) => tagName === text.toLowerCase(),
  );
}

function renderHTMLLinebreak(
  node: MarkdownNode,
  children: React.ReactElement[],
  parent: MarkdownNode[],
  style: typeof baseMarkdownStyles,
) {
  return renderRules.softbreak(node, children, parent, style);
}
