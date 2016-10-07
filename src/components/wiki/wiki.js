import {View, Linking} from 'react-native';
import React, {PropTypes, Component} from 'react';
import SimpleMarkdown from 'simple-markdown';
import Router from '../router/router';
import wikiRules from './wiki__rules';
import {decorateIssueLinks, replaceImageNamesWithUrls, decorateUserNames} from './wiki__raw-text-decorator';

export default class Wiki extends Component {
  constructor(props) {
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

Wiki.propTypes = {
  onIssueIdTap: PropTypes.func.isRequired,
  attachments: PropTypes.array.isRequired
};

const decorateRawText = (source, wikifiedOnServer, attachments) => {
  let result = replaceImageNamesWithUrls(source, attachments);
  if (wikifiedOnServer) {
    result = decorateIssueLinks(result, wikifiedOnServer);
    result = decorateUserNames(result, wikifiedOnServer);
  }
  return result;
};

export {decorateRawText};
