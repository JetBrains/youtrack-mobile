/* @flow */
import {Linking} from 'react-native';
import React, {Component} from 'react';
import HTMLView from 'react-native-htmlview';

import Router from '../router/router';
import styles from './wiki.styles';
import {renderCode, renderImage} from './wiki__renderers';

type Props = {
  style?: any,
  children?: ReactElement<any>,
  attachments: Array<Object>,
  imageHeaders: ?Object,
  onIssueIdTap: (issueId: string) => any
};

const HTML_RENDER_NOTHING = null;
const HTML_RENDER_DEFAULT = undefined;

export default class Wiki extends Component {
  props: Props;
  parser: (rawWiki: string, options: Object) => Object;
  renderer: (tree: Object) => Object;

  static defaultProps: Props = {
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

    //TODO: handle same instance urls like "/youtrack/user/foo";

    return Linking.openURL(url);
  };

  onImagePress = (url: String) => {
    const allImagesUrls = this.props.attachments
      .filter(attach => attach.mimeType.includes('image'))
      .map(image => image.url);

    return Router.ShowImage({currentImage: url, allImagesUrls, imageHeaders: this.props.imageHeaders});
  };

  renderNode = (node: Object, index: number, siblings: any, parent: Object, defaultRenderer: any => any) => {
    const {imageHeaders, attachments} = this.props;

    if (node.type === 'text' && node.data === '\n') {
      return HTML_RENDER_NOTHING;
    }

    if (node.name === 'pre') {
      return renderCode(node, index);
    }

    if (node.name === 'img') {
      return renderImage({node, index, attachments, imageHeaders, onImagePress: this.onImagePress});
    }

    return HTML_RENDER_DEFAULT;
  };

  render() {
    const {children} = this.props;

    return (
      <HTMLView
        value={children}
        stylesheet={styles}
        renderNode={this.renderNode}
        onLinkPress={this.handleLinkPress}

        textComponentProps={{style: styles.textBaseStyle}}
      />
    );
  }
}
