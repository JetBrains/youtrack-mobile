/* @flow */

import React from 'react';
import {ActivityIndicator, Linking, Text, TouchableOpacity, View} from 'react-native';

import {WebView} from 'react-native-webview';

import HTML from './renderers/renderer__html';
import Hyperlink from 'react-native-hyperlink';
import renderRules from 'react-native-markdown-display/src/lib/renderRules';
import UrlParse from 'url-parse';

import calculateAspectRatio from 'components/aspect-ratio/aspect-ratio';
import CodeHighlighter from './code-renderer';
import ImageWithProgress from 'components/image/image-with-progress';
import renderArticleMentions from './renderers/renderer__article-mentions';
import Router from 'components/router/router';
import {getApi} from 'components/api/api__instance';
import {guid, isURLPattern} from 'util/util';
import {hasMimeType} from 'components/mime-type/mime-type';
import {IconCheckboxBlank, IconCheckboxChecked} from 'components/icon/icon';
import {whiteSpacesRegex} from './util/patterns';

import styles from './youtrack-wiki.styles';

import type {Article} from 'flow/Article';
import type {Attachment, ImageDimensions, IssueProject} from 'flow/CustomFields';
import type {IssueFull} from 'flow/Issue';
import type {MarkdownASTNode} from 'flow/Markdown';
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {UITheme} from 'flow/Theme';

export type Mentions = {
  articles: Array<Article>,
  issues: Array<IssueFull>,
}


const issueIdRegExp: RegExp = /([a-zA-Z]+-)+\d+/g;
const imageEmbedRegExp: RegExp = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
const imageRegExp: RegExp = /<img [^>]*src=(["“'])[^"]*(["”'])[^>]*>/i;
const imageWidth: RegExp = /{width=\d+(%|px)?}/i;
const imageHeight: RegExp = /{height=\d+(%|px)?}/i;
const youTubeURL: RegExp = /^(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/i;
const htmlTagRegex = /(<([^>]+)>)/gi;
const googleCalendarURL: RegExp = /^http(s?):\/\/calendar.google.([a-z]{2,})\/calendar/i;
const googleDocsURL: RegExp = /^http(s?):\/\/docs.google.([a-z]{2,})\/document/i;
const figmaURL: RegExp = /^http(s?):\/\/(www\.)?figma.com/i;

function getYouTubeId(url: string): ?string {
  const arr = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return undefined !== arr[2] ? arr[2].split(/[^\w-]/i)[0] : arr[0];
}

function getMarkdownRules(
  attachments: Array<Attachment> = [],
  projects: Array<IssueProject> = [],
  uiTheme: UITheme,
  mentions?: Mentions,
  onCheckboxUpdate?: (checked: boolean, position: number) => void,
  textStyle: TextStyleProp = {},
): Object {

  function renderVideo(youtubeVideoId: string, key: string): React$Element<typeof WebView> {
    return (
      <WebView
        key={key}
        style={styles.video}
        source={{uri: `https://youtube.com/embed/${youtubeVideoId}?playsinline=1&controls:1`}}
        allowsFullscreenVideo={false}
        allowsInlineMediaPlayback={true}
        renderLoading={() => <ActivityIndicator color={uiTheme.colors.$link}/>}
        mediaPlaybackRequiresUserAction={true}
        androidLayerType= "hardware"
        mixedContentMode="always"
        javaScriptEnabled={true}
      />
    );
  }


  const markdownImage = ({key, uri, alt, imageDimensions}) => {
    if (isGitHubBadge(uri)) {
      return null;
    }

    const dimensions: ImageDimensions = calculateAspectRatio(
      imageDimensions ||
      {width: 250, height: 300}
    );

    const youtubeVideoId: ?string = getYouTubeId(uri);
    if (youTubeURL.test(uri) && youtubeVideoId) {
      return renderVideo(youtubeVideoId, key);
    }

    let imageHeaders;
    try {
      imageHeaders = getApi().auth.getAuthorizationHeaders();
    } catch (e) {
      imageHeaders = {};
    }
    const imageProps: Object = {
      key,
      style: dimensions,
      source: {uri, headers: imageHeaders},
    };

    if (alt) {
      imageProps.accessible = true;
      imageProps.accessibilityLabel = alt;
    }

    return <ImageWithProgress {...imageProps} />;
  };

  const isNodeContainsCheckbox = (node: MarkdownASTNode): boolean => {
    let hasCheckbox: boolean = false;
    let nodeChildren: Array<MarkdownASTNode> = node.children || [];
    while (nodeChildren?.length > 0) {
      hasCheckbox = nodeChildren.some((it) => it.type === 'checkbox');
      if (hasCheckbox) {
        break;
      }
      nodeChildren = nodeChildren[0] && nodeChildren[0].children;
    }
    return hasCheckbox;
  };

  const renderIssueIdLink = (issueId: string, styles: Array<Object>, key: string) => {
    return (
      <Text
        selectable={true}
        key={key}
        onPress={() => {
          Router.Issue({issueId: issueId.trim()});
        }}
        style={[styles, textStyle]}>
        {issueId}
      </Text>
    );
  };

  const renderHyperLink: (link: string, style: any) => React$Element<typeof Hyperlink> = (
    linkText: string,
    style: any
  ): React$Element<typeof Hyperlink> => (
    <Hyperlink
      key={guid()}
      linkStyle={style.link}
      linkDefault={true}>
      <Text selectable={true} style={style}>
        {linkText}
      </Text>
    </Hyperlink>
  );

  const textRenderer = (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}): any => {
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

    if (mentions && mentions.articles.concat(mentions.issues).length > 0) {
      return renderArticleMentions(node, mentions, uiTheme, style, inheritedStyles, textStyle);
    }

    if (text.match(imageEmbedRegExp)) {
      const attach: ?Attachment = attachments.find((it: Attachment) => it.name && text.includes(it.name));
      if (attach && attach.url && hasMimeType.image(attach)) {
        return markdownImage({
          key: node.key,
          uri: attach.url,
          alt: node?.attributes?.alt,
          imageDimensions: attach.imageDimensions,
        });
      }
    }

    if (issueIdRegExp.test(text) && !isURLPattern(text)) {
      const matched: RegExp$matchResult | null = text.match(issueIdRegExp);
      if (matched[0] && typeof matched?.index === 'number') {
        const textWithoutIssueId: string = text.split(matched[0]).join('');
        const linkStyle = [inheritedStyles, style.text, textStyle];
        return (
          <Text selectable={true} key={node.key} style={[inheritedStyles, style.text, textStyle]}>
            {renderHyperLink(textWithoutIssueId.slice(0, matched.index), linkStyle)}
            {renderIssueIdLink(matched[0], [inheritedStyles, style.text, textStyle, styles.link], `${node.key}1`)}
            {renderHyperLink(textWithoutIssueId.slice(matched.index, text.length - 1), linkStyle)}
          </Text>
        );
      }
      return renderIssueIdLink(text, [inheritedStyles, style.text, textStyle, styles.link], node.key);
    }

    return (
      <Text key={node.key} style={[inheritedStyles, style.text, textStyle]}>
        {text}
      </Text>
    );
  };


  return {
    blockquote: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => (
      <View key={node.key} style={[style.blockquote, textStyle]}>
        {children}
      </View>
    ),

    image: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      const {src = '', alt} = node.attributes;
      const targetAttach: ?Attachment = attachments.find((it: Attachment) => it.name && it.name.includes(src));

      const parsedURL = UrlParse(src);
      const url: ?string = parsedURL?.protocol && parsedURL?.origin ? src : targetAttach?.url;
      if (!url || hasMimeType.svg(targetAttach)) {
        return null;
      }

      if (isGoogleShared(url) || isFigmaImage(url)) {
        return renderHyperLink(url, [inheritedStyles, style.link, textStyle]);
      }

      return markdownImage({
        key: node.key,
        uri: url,
        alt: alt,
        imageDimensions: targetAttach?.imageDimensions,
      });
    },

    code_inline: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      return (
        <Text selectable={true} key={node.key} style={[inheritedStyles, styles.inlineCode]}>
          {node.content}
        </Text>
      );
    },

    fence: (node: MarkdownASTNode) => <CodeHighlighter key={node.key} node={node} uiTheme={uiTheme}/>,

    link: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      const child: ?Object = node?.children[0];
      let content: string = (child && child.content) || children;

      if (imageRegExp.test(content)) {
        return null; //do not render image HTML markup in a link
      }

      if (content.replace && !content.replace(htmlTagRegex, '')) {
        content = node.children.map(it => it.content).join('').replace(htmlTagRegex, '');
      }

      return (
        <Text
          selectable={true}
          key={node.key}
          style={[inheritedStyles, style.text, styles.link, textStyle]}
          onPress={() => Linking.openURL(node.attributes.href)}
        >
          {content}
        </Text>
      );
    },

    list_item: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      const hasCheckbox: boolean = isNodeContainsCheckbox(node);
      return renderRules.list_item(
        node,
        children,
        parent,
        (hasCheckbox ? {
          ...style,
          bullet_list_icon: {
            ...style.bullet_list_icon,
            ...style.bullet_list_icon_checkbox,
            ...textStyle,
          },
        } : style),
        inheritedStyles
      );
    },

    inline: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      return isNodeContainsCheckbox(node) ? (
        <View key={node.key} style={[inheritedStyles, style.inline, styles.checkboxRow]}>
          {children}
        </View>
      ) : (renderRules.inline(
        node,
        children,
        parent,
        style,
        inheritedStyles
      ));
    },

    textgroup: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      return isNodeContainsCheckbox(node) ? (
        <View key={node.key} style={[inheritedStyles, style.textgroup, styles.checkboxTextGroup]}>
          {children}
        </View>
      ) : (renderRules.textgroup(
        node,
        children,
        parent,
        style,
        inheritedStyles,
        textStyle,
      ));
    },

    checkbox: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      const isChecked: boolean = node.attributes.checked === true;
      const position: number = node.attributes.position;
      const CheckboxIcon: Object = isChecked ? IconCheckboxChecked : IconCheckboxBlank;
      const text: string = node.content.trim();
      return (
        <TouchableOpacity
          key={node.key}
          style={[inheritedStyles, styles.checkboxRow]}
          onPress={() => onCheckboxUpdate && onCheckboxUpdate(!isChecked, position)}
        >
          <CheckboxIcon
            size={24}
            color={uiTheme.colors.$icon}
            style={[styles.checkboxIcon, !isChecked && styles.checkboxIconBlank]}
          />
          <Text selectable={true} style={[inheritedStyles, style.text, styles.checkboxLabel, textStyle]}>
            {issueIdRegExp.test(text)
              ? renderIssueIdLink(text, [inheritedStyles, style.text, styles.link], node.key)
              : text}
          </Text>
        </TouchableOpacity>
      );
    },

    text: textRenderer,

    s: (node: MarkdownASTNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      return isNodeContainsCheckbox(node) ? (
        <View key={node.key} style={[inheritedStyles, style.textgroup]}>
          {children}
        </View>
      ) : (renderRules.s(
        node,
        children,
        parent,
        style,
        inheritedStyles,
        textStyle,
      ));
    },

    html_block: (node: MarkdownNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      if (isHTMLLinebreak(node.content)) {
        return renderHTMLLinebreak(node, children, parent, style);
      }
      return <HTML html={node.content}/>;
    },

    html_inline: (node: MarkdownNode, children: Object, parent: Object, style: Object, inheritedStyles: Object = {}) => {
      if (isHTMLLinebreak(node.content)) {
        return renderHTMLLinebreak(node, children, parent, style, inheritedStyles);
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

function isGitHubBadge(url: string = ''): boolean {
  return url.indexOf('badgen.net/badge') !== -1;
}

function isHTMLLinebreak(text: string): boolean {
  return (['<br>', '<br/>'].some((tagName: string) => tagName === text.toLowerCase()));
}


function renderHTMLLinebreak(node: MarkdownNode, children: Object, parent: Object, style: Object) {
  return renderRules.softbreak(node, children, parent, style);
}
