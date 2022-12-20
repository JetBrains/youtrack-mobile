import React from 'react';
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import type {
  Attachment,
  ImageDimensions,
  IssueProject,
} from 'flow/CustomFields';
import type {IssueFull} from 'flow/Issue';
import type {MarkdownASTNode} from 'flow/Markdown';
import type {TextStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {UITheme} from 'flow/Theme';
export type Mentions = {
  articles: Array<Article>;
  issues: Array<IssueFull>;
};
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

function getYouTubeId(url: string): string | null | undefined {
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
): Record<string, any> {
  function renderVideo(
    youtubeVideoId: string,
    key: string,
  ): React.ReactElement<React.ComponentProps<typeof WebView>, typeof WebView> {
    return (
      <WebView
        key={key}
        style={styles.video}
        source={{
          uri: `https://youtube.com/embed/${youtubeVideoId}?playsinline=1&controls:1`,
        }}
        allowsFullscreenVideo={false}
        allowsInlineMediaPlayback={true}
        renderLoading={() => <ActivityIndicator color={uiTheme.colors.$link} />}
        mediaPlaybackRequiresUserAction={true}
        androidLayerType="hardware"
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
      imageDimensions || {
        width: 250,
        height: 300,
      },
    );
    const youtubeVideoId: string | null | undefined = getYouTubeId(uri);

    if (youTubeURL.test(uri) && youtubeVideoId) {
      return renderVideo(youtubeVideoId, key);
    }

    let imageHeaders;

    try {
      imageHeaders = getApi().auth.getAuthorizationHeaders();
    } catch (e) {
      imageHeaders = {};
    }

    const imageProps: Record<string, any> = {
      key,
      style: dimensions,
      source: {
        uri,
        headers: imageHeaders,
      },
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
      hasCheckbox = nodeChildren.some(it => it.type === 'checkbox');

      if (hasCheckbox) {
        break;
      }

      nodeChildren = nodeChildren[0] && nodeChildren[0].children;
    }

    return hasCheckbox;
  };

  const renderIssueIdLink = (
    issueId: string,
    styles: Array<Record<string, any>>,
    key: string,
  ) => {
    return (
      <Text
        selectable={true}
        key={key}
        onPress={() => {
          Router.Issue({
            issueId: issueId.trim(),
          });
        }}
        style={[styles, textStyle]}
      >
        {issueId}
      </Text>
    );
  };

  const renderHyperLink = (
    linkText: string,
    style: any,
  ): React.ReactElement<
    React.ComponentProps<typeof Hyperlink>,
    typeof Hyperlink
  > => (
    <Hyperlink key={guid()} linkStyle={style.link} linkDefault={true}>
      <Text selectable={true} style={style}>
        {linkText}
      </Text>
    </Hyperlink>
  );

  const textRenderer = (
    node: MarkdownASTNode,
    children: Record<string, any>,
    parent: Record<string, any>,
    style: Record<string, any>,
    inheritedStyles: Record<string, any> = {},
  ): any => {
    const text: string = node.content
      .replace(imageHeight, '')
      .replace(imageWidth, '')
      .replace(whiteSpacesRegex, ' ')
      .replace(htmlTagRegex, ' ');

    if (!text) {
      return null;
    }

    if (mentions && mentions.articles.concat(mentions.issues).length > 0) {
      return renderArticleMentions(
        node,
        mentions,
        uiTheme,
        style,
        inheritedStyles,
        textStyle,
      );
    }

    if (text.match(imageEmbedRegExp)) {
      const attach: Attachment | null | undefined = attachments.find(
        (it: Attachment) => it.name && text.includes(it.name),
      );

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
      const matched: RegExpMatchArray | null = text.match(issueIdRegExp);

      if (matched && matched[0]) {
        const matchedIndex: number = text.search(matched[0]);
        const linkStyle = [inheritedStyles, style.text, textStyle];
        return (
          <Text
            selectable={true}
            key={node.key}
            style={[inheritedStyles, style.text, textStyle]}
          >
            {renderHyperLink(text.slice(0, matchedIndex), linkStyle)}
            {renderIssueIdLink(
              matched[0],
              [inheritedStyles, style.text, textStyle, styles.link],
              `${node.key}1`,
            )}
            {renderHyperLink(
              text.slice(matchedIndex + matched[0].length, text.length - 1),
              linkStyle,
            )}
          </Text>
        );
      }

      return renderHyperLink(text, [
        inheritedStyles,
        style.text,
        textStyle,
        styles.link,
      ]);
    }

    return (
      <Text
        key={node.key}
        style={{...inheritedStyles, ...style.text, ...textStyle}}
      >
        {text}
      </Text>
    );
  };

  return {
    blockquote: (
      node: MarkdownASTNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => (
      <View key={node.key} style={[style.blockquote, textStyle]}>
        {children}
      </View>
    ),
    image: (
      node: MarkdownASTNode,
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
        return renderHyperLink(url, [inheritedStyles, style.link, textStyle]);
      }

      return markdownImage({
        key: node.key,
        uri: url,
        alt: alt,
        imageDimensions: targetAttach?.imageDimensions,
      });
    },
    code_inline: (
      node: MarkdownASTNode,
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
    fence: (node: MarkdownASTNode) => (
      <CodeHighlighter key={node.key} node={node} uiTheme={uiTheme} />
    ),
    link: (
      node: MarkdownASTNode,
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
          style={[inheritedStyles, style.text, styles.link, textStyle]}
          onPress={() => Linking.openURL(node.attributes.href)}
        >
          {content}
        </Text>
      );
    },
    list_item: (
      node: MarkdownASTNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      const hasCheckbox: boolean = isNodeContainsCheckbox(node);
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
                ...textStyle,
              },
            }
          : style,
        inheritedStyles,
      );
    },
    inline: (
      node: MarkdownASTNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return isNodeContainsCheckbox(node) ? (
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
      node: MarkdownASTNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return isNodeContainsCheckbox(node) ? (
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
      node: MarkdownASTNode,
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
      return (
        <TouchableOpacity
          key={node.key}
          style={[inheritedStyles, styles.checkboxRow]}
          onPress={() =>
            onCheckboxUpdate && onCheckboxUpdate(!isChecked, position)
          }
        >
          <CheckboxIcon
            size={24}
            color={uiTheme.colors.$icon}
            style={[
              styles.checkboxIcon,
              !isChecked && styles.checkboxIconBlank,
            ]}
          />
          <Text
            selectable={true}
            style={[
              inheritedStyles,
              style.text,
              styles.checkboxLabel,
              textStyle,
            ]}
          >
            {issueIdRegExp.test(text)
              ? renderIssueIdLink(
                  text,
                  [inheritedStyles, style.text, styles.link],
                  node.key,
                )
              : text}
          </Text>
        </TouchableOpacity>
      );
    },
    text: textRenderer,
    s: (
      node: MarkdownASTNode,
      children: Record<string, any>,
      parent: Record<string, any>,
      style: Record<string, any>,
      inheritedStyles: Record<string, any> = {},
    ) => {
      return isNodeContainsCheckbox(node) ? (
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

function isGitHubBadge(url: string = ''): boolean {
  return url.indexOf('badgen.net/badge') !== -1;
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