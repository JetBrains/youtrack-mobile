/* @flow */

import {Linking, Text} from 'react-native';
import React, {PureComponent} from 'react';
import HTMLView from 'react-native-htmlview';
import toHtml from 'htmlparser-to-html';

import Router from '../router/router';
import styles, {htmlViewStyles} from './wiki.styles';
import {COLOR_FONT} from '../variables/variables';
import {getBaseUrl} from '../config/config';
import {renderCode, renderImage, renderTable, renderTableRow, renderTableCell} from './wiki__renderers';
import {extractId} from '../open-url-handler/open-url-handler';
import {showMoreInlineText} from '../text-view/text-view';
import {hasMimeType} from '../mime-type/mime-type';

HTMLView.propTypes.style = Text.propTypes.style;

type Props = {
  style?: any,
  children?: React$Element<any>,
  attachments: Array<Object>,
  imageHeaders: ?Object,
  backendUrl: string,
  onIssueIdTap: (issueId: string) => any,
  title?: string,
  renderFullException?: boolean
};

const HTML_RENDER_NOTHING = null;
const HTML_RENDER_DEFAULT = undefined;

const selector = (node: Object, tag: string, className: string): boolean => {
  if (node.name !== tag) {
    return false;
  }

  const classes = node.attribs.class && node.attribs.class.split(' ');
  return !!classes && classes.some(it => it === className);
};

const RootComponent = props => <Text {...props} />;

export default class Wiki extends PureComponent<Props, void> {
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
    return Router.ShowImage({
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
          title: this.props.title,
          onIssueIdTap: this.handleLinkPress
        }))}
      >
        {showMoreInlineText}
      </Text>
    );
  };

  renderNode = (node: Object, index: number, siblings: Array<any>, parent: Object, defaultRenderer: (any, any) => any) => {
    const {imageHeaders, attachments} = this.props;

    if (node.type === 'text' && node.data === '\n') {
      return HTML_RENDER_NOTHING;
    }

    if (selector(node, 'span', 'wiki-plus')) {
      return HTML_RENDER_NOTHING;
    }

    if (!this.props.renderFullException && selector(node, 'span', 'wiki-hellip')) {
      return HTML_RENDER_NOTHING;
    }

    if (!this.props.renderFullException && selector(node, 'pre', 'wiki-exception')) {
      return this.renderShowFullExceptionLink(node, index);
    }

    if (node.name === 'input') {
      return <Text key={`checkbox-${node.attribs['data-position']}`}>{'checked' in node.attribs ? '✓' : '☐'}</Text>;
    }

    if (selector(node, 'pre', 'wikicode')) {
      if (node.children[0] && node.children[0].name === 'code') {
        return renderCode(node.children[0], index, this.props.title);
      }
      return renderCode(node, index, this.props.title);
    }

    if (node.name === 'img') {
      return renderImage({
        node,
        index,
        attachments,
        imageHeaders,
        onImagePress: this.onImagePress
      });
    }

    if (node.name === 'p') {
      const isLast = index === siblings.length - 2; // Paraghaph always have "\n" last sibling
      return (
        <Text key={index}>
          {index === 0 ? null : '\n'}
          {defaultRenderer(node.children, parent)}
          {isLast ? null : '\n'}
        </Text>
      );
    }

    if (node.name === 'strong') {
      return (
        <Text key={index} style={{fontWeight: 'bold'}}>{defaultRenderer(node.children, parent)}</Text>
      );
    }

    if (selector(node, 'ul', 'wiki-list1')) {
      return (
        <Text key={index}>{'   - '}{defaultRenderer(node.children, parent)}</Text>
      );
    }

    if (node.name === 'font') {
      return (
        <Text key={index} style={{color: node.attribs.color || COLOR_FONT}}>{defaultRenderer(node.children,
          parent)}</Text>
      );
    }

    if (node.name === 'del') {
      return (
        <Text key={index} style={styles.deleted}>{defaultRenderer(node.children, parent)}</Text>
      );
    }

    if (selector(node, 'span', 'monospace')) {
      return (
        <Text key={index} style={styles.monospace}>{defaultRenderer(node.children, parent)}</Text>
      );
    }

    if (selector(node, 'div', 'quote') || node.name === 'blockquote') {
      return (
        <Text key={index} style={styles.blockQuote}>{'> '}{defaultRenderer(node.children, parent)}</Text>
      );
    }

    if (node.name === 'table') {
      return renderTable(node, index, defaultRenderer);
    }

    if (node.name === 'tr') {
      return renderTableRow(node, index, defaultRenderer);
    }

    if (node.name === 'td' || node.name === 'th') {
      return renderTableCell(node, index, defaultRenderer);
    }

    return HTML_RENDER_DEFAULT;
  };

  render() {
    const {children} = this.props;

    return (
      <HTMLView
        value={children}
        stylesheet={htmlViewStyles}
        renderNode={this.renderNode}
        onLinkPress={this.handleLinkPress}

        RootComponent={RootComponent}
        textComponentProps={{selectable: true}}
        style={styles.htmlView}
      />
    );
  }
}
