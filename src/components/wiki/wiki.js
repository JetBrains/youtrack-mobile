import React, {View} from 'react-native';
import SimpleMarkdown from 'simple-markdown';
import styles from './wiki.styles';
import wikiRules from './wiki__rules';

export default class Wiki extends React.Component {
  constructor() {
    super();
    const rules = wikiRules(styles);

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

const replaceImageNamesWithUrls = (source, attachments) => {
  const ImageRegExp = /\![a-zA-Z0-9\s-]+?\.[a-zA-Z]+?\!/;

  return source.replace(ImageRegExp, (imageName) => {
    let attach = attachments.filter(a => `!${a.name}!` === imageName)[0];
    if (attach) {
      return `!${attach.url}!`;
    }
    return imageName;
  });
};

export {replaceImageNamesWithUrls};
