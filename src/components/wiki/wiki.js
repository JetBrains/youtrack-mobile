/* @flow */
import {View, Linking} from 'react-native';
import React, {Component} from 'react';
// $FlowFixMe: cannot typecheck simple-markdown module because of mistakes there
import SimpleMarkdown from 'simple-markdown';
import Router from '../router/router';
import wikiRules from './wiki__rules';
import {decorateIssueLinks, replaceImageNamesWithUrls, decorateUserNames} from './wiki__raw-text-decorator';

type Props = {
  style?: any,
  children?: ReactElement<any>,
  attachments: Array<Object>,
  onIssueIdTap: (issueId: string) => any
};

export default class Wiki extends Component {
  props: Props;
  parser: (rawWiki: string) => Object;
  renderer: (tree: Object) => Object;

  static defaultProps = {
    onIssueIdTap: () => {},
    attachments: []
  };

  constructor(props: Props) {
    super(props);
    const rules = wikiRules({
      onLinkPress: (url) => {
        return Linking.openURL(url);
      },
      onImagePress: (url) => {
        const allImagesUrls = props.attachments
          .filter(attach => attach.mimeType.includes('image'))
          .map(image => image.url);

        return Router.ShowImage({currentImage: url, allImagesUrls});
      },
      onIssueIdPress: (issueId) => {
        this.props.onIssueIdTap && this.props.onIssueIdTap(issueId);
      }
    });

    this.parser = SimpleMarkdown.parserFor(rules);

    this.renderer = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'));
  }

  parse(source: string) {
    const blockSource = `${source}\n\n`;
    return this.parser(blockSource, {inline: false});
  }

  render() {
    const {children} = this.props;
    if (!children) {
      return null;
    }
    const child = Array.isArray(children) ? children.join('') : children.toString();

    const tree = this.parse(child);

    return <View style={[this.props.style]}>{this.renderer(tree)}</View>;
  }
}

const decorateRawText = (source: string, wikifiedOnServer: string, attachments: Array<Object>) => {
  let result = replaceImageNamesWithUrls(source, attachments);
  if (wikifiedOnServer) {
    result = decorateIssueLinks(result, wikifiedOnServer);
    result = decorateUserNames(result, wikifiedOnServer);
  }
  return result;
};

export {decorateRawText};
