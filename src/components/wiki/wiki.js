import {View, Linking} from 'react-native';
import React from 'react';
import SimpleMarkdown from 'simple-markdown';
import Router from '../router/router';
import wikiRules from './wiki__rules';
import {decorateIssueLinks, replaceImageNamesWithUrls, decorateUserNames} from './wiki__raw-text-decorator';

export default class Wiki extends React.Component {
  constructor() {
    super();
    const rules = wikiRules({
      onLinkPress: (url) => {
        return Linking.openURL(url);
      },
      onImagePress: (url) => {
        return Router.ShowImage({imageUrl: url, imageName: ''})
      },
      onIssueIdPress: (issueId) => {
        this.props.onIssueIdTap && this.props.onIssueIdTap(issueId);
      }
    });

    this.parser = SimpleMarkdown.parserFor(rules);

    this.renderer = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'react'));
  }

  parse(source) {
    const blockSource = `${source}\n\n`;
    return this.parser(blockSource, {inline: false});
  }

  render() {
    const child = Array.isArray(this.props.children) ? this.props.children.join('') : this.props.children;

    const tree = this.parse(child);

    return <View style={[this.props.style]}>{this.renderer(tree)}</View>;
  }
}

const decorateRawText = (source, wikifiedOnServer, attachments) => {
  let result = replaceImageNamesWithUrls(source, attachments);
  result = decorateIssueLinks(result, wikifiedOnServer);
  result = decorateUserNames(result, wikifiedOnServer);
  return result;
};

export {decorateRawText};
