import React, {Text, View, Image} from 'react-native';
import SimpleMarkdown from 'simple-markdown';
import styles from './wiki.styles';

export default function (actions) {
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
        return <Text onPress={() => actions.onImagePress(node.url)} key={state.key}>
          <Image source={{uri: node.url, width: 150, height: 150}} style={styles.image}/>
        </Text>;
      }
    }),

    link: Object.assign({}, SimpleMarkdown.defaultRules.link, {
      match: source => /^https?:\/\/\S*/.exec(source),

      parse: (capture, parse, state) => {
        return {
          url: capture[0]
        };
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.link} onPress={() => actions.onLinkPress(node.url)}>{node.url}</Text>
      }
    }),

    codeBlock: Object.assign({}, SimpleMarkdown.defaultRules.codeBlock, {
      match: source => /^```([\s\S]+?)```(?!```)/.exec(source),

      parse: function(capture) {
        return {
          content: capture[1].replace(/^\n+/, '')
        };
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.codeBlock}>{node.content}</Text>
      }
    }),

    inlineCode: Object.assign({}, SimpleMarkdown.defaultRules.inlineCode, {
      react: (node, output, state) => {
        return <Text key={state.key} style={styles.inlineCode}>{node.content}</Text>
      }
    })
  }
}
