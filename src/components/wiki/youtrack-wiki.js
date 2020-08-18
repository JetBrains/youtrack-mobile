/* @flow */

import {Linking, Text} from 'react-native';
import React, {PureComponent} from 'react';
import HTMLView from 'react-native-htmlview';
import toHtml from 'htmlparser-to-html';

import Router from '../router/router';
import renderCode from './code-renderer';
import {renderImage, renderTable, renderTableRow, renderTableCell} from './youtrack-wiki__renderers';
import {getBaseUrl} from '../config/config';
import {extractId} from '../open-url-handler/open-url-handler';
import {hasMimeType} from '../mime-type/mime-type';
import {nodeHasType} from './youtrack-wiki__node-type';
import {showMoreInlineText} from '../text-view/text-view';

import styles, {htmlViewStyles} from './wiki.styles';
import {COLOR_FONT} from '../variables/variables';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

HTMLView.propTypes.style = Text.propTypes.style;

type Props = {
  style?: ViewStyleProp,
  children?: React$Element<any>,
  attachments: Array<Object>,
  imageHeaders: ?Object,
  backendUrl: string,
  onIssueIdTap: (issueId: string) => any,
  renderFullException?: boolean
};

const HTML_RENDER_NOTHING = null;
const HTML_RENDER_DEFAULT = undefined;
const RootComponent = props => <Text {...props} />;

export default class YoutrackWiki extends PureComponent<Props, void> {
  static defaultProps: Object = {
    onIssueIdTap: (issueId: string) => {},
    attachments: [],
    imageHeaders: null
  };

  parser: (rawWiki: string, options: Object) => Object;
  renderer: (tree: Object) => Object;


  handleLinkPress = (url: string) => {
    const issueId = extractId(url);

    if (issueId) {
      return this.props.onIssueIdTap(issueId);
    }

    if (url[0] === '/') {
      url = getBaseUrl(this.props.backendUrl) + url;
    }

    return Linking.openURL(url);
  };

  onImagePress = (source: Object) => {
    return Router.Image({
      current: source,
      imageAttachments: this.props.attachments.filter(attach => hasMimeType.previewable(attach)),
      imageHeaders: this.props.imageHeaders
    });
  };

  renderShowFullExceptionLink = (node: Node, index: number) => {
    return (
      <Text
        key={index}
        style={styles.exceptionLink}
        onPress={() => requestAnimationFrame(() => Router.WikiPage({
          wikiText: toHtml(node),
          onIssueIdTap: this.handleLinkPress
        }))}
      >
        {showMoreInlineText}
      </Text>
    );
  };

  getLanguage(node: Object): string {
    return (node?.attribs?.class || '').split('language-').pop();
  }

  renderNode = (node: Object, index: number, siblings: Array<any>, parent: Object, defaultRenderer: (any, any) => any) => {
    const {imageHeaders, attachments, renderFullException} = this.props;
    const wikiNodeType = nodeHasType(node);
    const getCode = () => (node.children[0] && node.children[0].name === 'code') ? node.children[0] : node;

    switch (true) {

    case (
      wikiNodeType.textOrNewLine ||
      wikiNodeType.expandCollapseToggle ||
      (wikiNodeType.exceptionTitle && !renderFullException)
    ):
      return HTML_RENDER_NOTHING;

    case (wikiNodeType.exception && !renderFullException):
      return this.renderShowFullExceptionLink(node, index);

    case (wikiNodeType.checkbox):
      return <Text key={`checkbox-${node.attribs['data-position']}`}>{'checked' in node.attribs ? '✓' : '☐'}</Text>;

    case (wikiNodeType.code):
      return renderCode(
        getCode(),
        index,
        this.getLanguage(getCode())
      );

    case (wikiNodeType.image):
      return renderImage({
        node,
        index,
        attachments: attachments.filter(Boolean),
        imageHeaders,
        onImagePress: this.onImagePress
      });

    case (wikiNodeType.p):
      // Paragraph always have "\n" last sibling --> `index === siblings.length - 2`
      return (
        <Text key={index}>
          {index === 0 ? null : '\n'}
          {defaultRenderer(node.children, parent)}
          {((siblings || []).length - 2) === index ? null : '\n'}
        </Text>
      );

    case (wikiNodeType.strong):
      return <Text key={index} style={{fontWeight: 'bold'}}>{defaultRenderer(node.children, parent)}</Text>;

    case (wikiNodeType.ul):
      return <Text key={index}>{'   - '}{defaultRenderer(node.children, parent)}</Text>;

    case (wikiNodeType.font):
      return (
        <Text
          key={index}
          style={{color: node.attribs.color || COLOR_FONT}}>{defaultRenderer(node.children, parent)}</Text>
      );

    case (wikiNodeType.del):
      return <Text key={index} style={styles.deleted}>{defaultRenderer(node.children, parent)}</Text>;

    case (wikiNodeType.monospace):
      return <Text key={index} style={styles.monospace}>{defaultRenderer(node.children, parent)}</Text>;

    case (wikiNodeType.quoteOrBlockquote):
      return <Text key={index} style={styles.blockQuote}>{'> '}{defaultRenderer(node.children, parent)}</Text>;

    case (wikiNodeType.table):
      return renderTable(node, index, defaultRenderer);

    case (wikiNodeType.tr):
      return renderTableRow(node, index, defaultRenderer);

    case (wikiNodeType.td || wikiNodeType.th):
      return renderTableCell(node, index, defaultRenderer);

    default:
      return HTML_RENDER_DEFAULT;
    }
  };

  render() {
    const {children, style} = this.props;

    return (
      <HTMLView
        value={children}
        stylesheet={htmlViewStyles}
        renderNode={this.renderNode}
        onLinkPress={this.handleLinkPress}

        RootComponent={RootComponent}
        textComponentProps={{selectable: true}}
        style={[styles.htmlView, style]}
      />
    );
  }
}
