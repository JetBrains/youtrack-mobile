import {Text, View, Image} from 'react-native';
import React from 'react';
import SimpleMarkdown from 'simple-markdown';
import styles from './wiki.styles';

const CONTENT_WITH_MARKERS = 0;
const CONTENT_WITHIN_MARKERS = 1;

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

    monospace: Object.assign({}, SimpleMarkdown.defaultRules.strong, {
      match: source => {
        return /^{{([\s\S]+?)}}(?!}})/.exec(source) || /^{monospace}([\s\S]+?){monospace}(?!{monospace})/.exec(source)
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.monospace}>{output(node.content)}</Text>
      }
    }),

    heading: {
      order: SimpleMarkdown.defaultRules.strong.order,

      match: source => /^=([\s\S]+?)=(?!=)\n/.exec(source),

      parse: (capture, parse, state) => {
        return {
          content: parse(capture[CONTENT_WITHIN_MARKERS], state)
        };
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.heading}>{output(node.content)}{'\n'}</Text>;
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
        return {url: capture[CONTENT_WITHIN_MARKERS]};
      },

      react: (node, output, state) => {
        return <Text onPress={() => actions.onImagePress(node.url)} key={state.key}>
          <Image source={{uri: node.url, width: 150, height: 150}} style={styles.image}/>
        </Text>;
      }
    }),

    link: Object.assign({}, SimpleMarkdown.defaultRules.link, {
      match: source => /^\[(https?:\/\/\S*)\s?(.*?)\]/.exec(source) || /^<(https?:\/\/\S*)>/.exec(source),

      parse: function(capture, parse, state) {
        const res = {
            url: capture[CONTENT_WITHIN_MARKERS],
            content: capture[2] || capture[CONTENT_WITHIN_MARKERS]
        };
        return res;
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.link} onPress={() => actions.onLinkPress(node.url)}>{node.content}</Text>
      }
    }),

    issueIdLink: Object.assign({}, SimpleMarkdown.defaultRules.link, {
      match: source => /^\[ytmissue]([\s\S]+?)\|([\s\S]+?)\[ytmissue](?!\[ytmissue])/.exec(source),
      parse: function(capture, parse, state) {
        const res = {
          issueId: capture[CONTENT_WITHIN_MARKERS],
          issueSummary: capture[2]
        };
        return res;
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={[styles.link, {textDecorationLine: null}]}
                     onPress={() => actions.onIssueIdPress(node.issueId)}>{node.issueId}</Text>;
      }
    }),

    userLogin: Object.assign({}, SimpleMarkdown.defaultRules.link, {
      match: source => /^\[ytmuser]([\s\S]+?)\|([\s\S]+?)\[ytmuser](?!\[ytmuser])/.exec(source),
      parse: function(capture, parse, state) {
        const res = {
          login: capture[CONTENT_WITHIN_MARKERS],
          username: capture[2]
        };
        return res;
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={[styles.link, {textDecorationLine: null}]}>{node.username}</Text>;
      }
    }),

    url: Object.assign({}, SimpleMarkdown.defaultRules.url, {
      match: source => /^https?:\/\/\S*/.exec(source),

      parse: (capture, parse, state) => {
        return {
          url: capture[CONTENT_WITH_MARKERS]
        };
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.link} onPress={() => actions.onLinkPress(node.url)}>{node.url}</Text>
      }
    }),

    codeBlock: Object.assign({}, SimpleMarkdown.defaultRules.codeBlock, {
      match: source => /^```([\s\S]+?)```(?!```)/.exec(source) || /^\{code.*\}([\s\S]+?)\{code\}(?!\{code\})/.exec(source),

      parse: function(capture) {
        return {
          content: capture[CONTENT_WITHIN_MARKERS].replace(/^\n+/, '')
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
