import React, {Text, View} from 'react-native';
import SimpleMarkdown from 'simple-markdown';

export default function () {
  return {
    /**
     * Basic rules
     */
    newline: Object.assign({}, SimpleMarkdown.defaultRules.newline, {
      react: function (node, output, state) {
        return <Text key={state.key}>{'\n'}</Text>;
      }
    }),
    paragraph: Object.assign({}, SimpleMarkdown.defaultRules.paragraph, {
      react: function (node, output, state) {
        return <View key={state.key}>
          <Text>{output(node.content, state)}</Text>
        </View>;
      }
    }),
    text: Object.assign({}, SimpleMarkdown.defaultRules.text, {
      react: function (node, output, state) {
        return <Text key={state.key}>{node.content}</Text>;
      }
    }),

    /**
     * Custom YT wiki rules
     */
    strong: Object.assign({}, SimpleMarkdown.defaultRules.strong, {
      match: function (source) {
        return /^\*([\s\S]+?)\*(?!\*)/.exec(source);
      },

      react: function (node, output, state) {
        return <Text key={state.key} style={{fontWeight: 'bold'}}>{output(node.content)}</Text>
      }
    }),
  }
}
