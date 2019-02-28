/* @flow */
import {Linking, Text} from 'react-native';
import React, {Component} from 'react';
import HTMLView from 'react-native-htmlview';

import Router from '../router/router';
import styles, {htmlViewStyles} from './wiki.styles';
import {COLOR_FONT} from '../variables/variables';
import {getBaseUrl} from '../config/config';
import {renderCode, renderImage, renderTable, renderTableRow, renderTableCell} from './wiki__renderers';
import {extractId} from '../open-url-handler/open-url-handler';

HTMLView.propTypes.style = Text.propTypes.style;

type Props = {
  style?: any,
  children?: React$Element<any>,
  attachments: Array<Object>,
  imageHeaders: ?Object,
  backendUrl: string,
  onIssueIdTap: (issueId: string) => any
};

const HTML_RENDER_NOTHING = null;
const HTML_RENDER_DEFAULT = undefined;

const selector = (node: Object, tag: string, className: string) => {
  return node.name === tag &&
    node.attribs.class &&
    node.attribs.class.indexOf(className) !== -1;
};

const RootComponent = props => <Text {...props} />;

export default class Wiki extends Component<Props, void> {
  parser: (rawWiki: string, options: Object) => Object;
  renderer: (tree: Object) => Object;

  static defaultProps: Object = {
    onIssueIdTap: (issueId: string) => {},
    attachments: [],
    imageHeaders: null
  };

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

  onImagePress = (url: string) => {
    const allImagesUrls = this.props.attachments
      .filter(attach => attach.mimeType.includes('image'))
      .map(image => image.url);

    return Router.ShowImage({currentImage: url, allImagesUrls, imageHeaders: this.props.imageHeaders});
  };

  renderNode = (node: Object, index: number, siblings: Array<any>, parent: Object, defaultRenderer: (any, any) => any) => {
    const {imageHeaders, attachments} = this.props;

    if (node.type === 'text' && node.data === '\n') {
      return HTML_RENDER_NOTHING;
    }

    if (node.name === 'input') {
      return <Text key={`checkbox-${node.attribs['data-position']}`}>{'checked' in node.attribs ? '✓' : '☐' }</Text>;
    }

    if (selector(node, 'pre', 'wikicode')) {
      if (node.children[0] &&node.children[0].name === 'code') {
        return renderCode(node.children[0], index);
      }
      return renderCode(node, index);
    }

    if (node.name === 'img') {
      return renderImage({node, index, attachments, imageHeaders, onImagePress: this.onImagePress});
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
        <Text key={index} style={{color: node.attribs.color || COLOR_FONT}}>{defaultRenderer(node.children, parent)}</Text>
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
