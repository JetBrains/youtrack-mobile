import React, {View} from 'react-native';
import SimpleMarkdown from 'simple-markdown';
import rules from './wiki__rules';

export default class Wiki extends React.Component {
  constructor() {
    super();
    let rulesTmp = rules();

    this.parser = SimpleMarkdown.parserFor(rules());

    this.renderer = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rulesTmp, 'react'));
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
