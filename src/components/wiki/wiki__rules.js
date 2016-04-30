import React, {Text, View, Image} from 'react-native';
import SimpleMarkdown from 'simple-markdown';

export default function (styles) {
  return {
    /**
     * Basic rules
     */
    newline: Object.assign({}, SimpleMarkdown.defaultRules.newline, {
      react: (node, output, state) => {
        return <Text key={state.key}>{'\n'}</Text>;
      }
    }),
    paragraph: Object.assign({}, SimpleMarkdown.defaultRules.paragraph, {
      react: (node, output, state) => {
        return <View key={state.key}>
          <Text>{output(node.content, state)}</Text>
        </View>;
      }
    }),
    text: Object.assign({}, SimpleMarkdown.defaultRules.text, {
      react: (node, output, state) => {
        return <Text key={state.key}>{node.content}</Text>;
      }
    }),

    /**
     * Custom YT wiki rules
     */
    strong: Object.assign({}, SimpleMarkdown.defaultRules.strong, {
      match: source => {
        return /^\*([\s\S]+?)\*(?!\*)/.exec(source) || /^'''([\s\S]+?)'''(?!''')/.exec(source)
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.strong}>{output(node.content)}</Text>
      }
    }),

    heading: {
      order: SimpleMarkdown.defaultRules.strong.order,

      match: source => /^=([\s\S]+?)=(?!=)/.exec(source),

      parse: (capture, parse, state) => {
        return {
          content: parse(capture[1], state)
        };
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.heading}>{output(node.content)}</Text>;
      }
    },

    underline: Object.assign({}, SimpleMarkdown.defaultRules.u, {
      match: source => /^\+([\s\S]+?)\+(?!\+)/.exec(source),

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.underline}>{output(node.content)}</Text>
      }
    }),

    del: Object.assign({}, SimpleMarkdown.defaultRules.del, {
      match: source => /^--([\s\S]+?)--(?!--)/.exec(source),

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.del}>{output(node.content)}</Text>
      }
    }),

    italic: Object.assign({}, SimpleMarkdown.defaultRules.em, {
      match: source => /^''([\s\S]+?)''(?!'')/.exec(source),

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.italic}>{output(node.content)}</Text>
      }
    }),

    /**
     * NOTE: YT's wiki contains image names, not urls. Names should be first replaced with urls
     */
    image: Object.assign({}, SimpleMarkdown.defaultRules.image, {
      match: source => /^!([\s\S]+?)!(?!!)/.exec(source),

      parse: function(capture) {
        return {url: capture[1]};
      },

      react: (node, output, state) => {
        return <Image key={state.key} source={{uri: node.url}} style={styles.image}/>
      }
    })
  }
}
