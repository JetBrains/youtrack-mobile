/* @flow */
import {Linking, Text} from 'react-native';
import React, {Component} from 'react';
import HTMLView from 'react-native-htmlview';

import Router from '../router/router';
import styles, {htmlViewStyles} from './wiki.styles';
import {COLOR_FONT} from '../variables/variables';
import {getBaseUrl} from '../config/config';
import {renderCode, renderImage} from './wiki__renderers';

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

export default class Wiki extends Component<Props, void> {
  parser: (rawWiki: string, options: Object) => Object;
  renderer: (tree: Object) => Object;

  static defaultProps: Object = {
    onIssueIdTap: (issueId: string) => {},
    attachments: [],
    imageHeaders: null
  };

  handleLinkPress = (url: string) => {
    const ISSUE_ID_REGEX = /issue\/(.+)\/?/;

    const [, issueId] = url.match(ISSUE_ID_REGEX) || [];

    if (issueId) {
      return this.props.onIssueIdTap(issueId);
    }

    if (url[0] === '/') {
      url = getBaseUrl(this.props.backendUrl) + url;
    }

    return Linking.openURL(url);
  };

  onImagePress = (url: String) => {
    const allImagesUrls = this.props.attachments
      .filter(attach => attach.mimeType.includes('image'))
      .map(image => image.url);

    return Router.ShowImage({currentImage: url, allImagesUrls, imageHeaders: this.props.imageHeaders});
  };

  renderNode = (node: Object, index: number, siblings: any, parent: Object, defaultRenderer: (any, any) => any) => {
    const {imageHeaders, attachments} = this.props;

    if (node.type === 'text' && node.data === '\n') {
      return HTML_RENDER_NOTHING;
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

        RootComponent={Text}
        textComponentProps={{selectable: true}}
        style={styles.htmlView}
      />
    );
  }
}
