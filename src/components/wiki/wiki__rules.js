import React, {Text} from 'react-native';
import SimpleMarkdown from 'simple-markdown';

export default function() {
  return {
    bold: {
      order: SimpleMarkdown.defaultRules.em.order - 0.5,

      // First we check whether a string matches
      match: function(source) {
        return /^\*([\s\S]+?)\*(?!\*)/.exec(source);
      },

      // Then parse this string into a syntax node
      parse: function(capture, parse, state) {
        return {
          content: parse(capture[1], state)
        };
      },

      // Finally transform this syntax node into a
      // React element
      react: function(node, output, state) {
        return <Text key={state.key} style={{fontWeight: 'bold'}}>{output(node.content)}</Text>
      }
    },
    text: {
      order: SimpleMarkdown.defaultRules.text.order,
      match: function (source) {
        return /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]|\n\n| {2,}\n|\w+:\S|$)/.exec(source);
      },
      parse: function(capture, parse, state) {
        return {
          content: capture[0]
        };
      },
      react: function(node, output, state) {
        return <Text key={state.key}>{node.content}</Text>;
      }
    }
  }
}
