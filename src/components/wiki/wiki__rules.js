import {Text, View, Image, Platform} from 'react-native';
import React from 'react';
import flattenStyle from 'react-native/lib/flattenStyle';
import SimpleMarkdown from 'simple-markdown';
import styles from './wiki.styles';

const CONTENT_WITH_MARKERS = 0;
const CONTENT_WITHIN_MARKERS = 1;
const imageWidth = flattenStyle(styles.image).width * 2;
const imageHeight = flattenStyle(styles.image).height * 2;

export default function (actions) {
  return {
    /**
     * Basic rules
     */
    newline: Object.assign({}, SimpleMarkdown.defaultRules.newline, {
      react: (node, output, state) => {
        return <Text key={state.key} selectable={true} style={styles.commonTextItem}>{'\n'}</Text>;
      }
    }),
    paragraph: Object.assign({}, SimpleMarkdown.defaultRules.paragraph, {
      react: (node, output, state) => {
        return <View key={state.key}>
          <Text selectable={true} style={styles.commonTextItem}>{output(node.content, state)}</Text>
        </View>;
      }
    }),
    text: Object.assign({}, SimpleMarkdown.defaultRules.text, {
      react: (node, output, state) => node.content
    }),

    /**
     * Custom YT wiki rules
     */
    strong: Object.assign({}, SimpleMarkdown.defaultRules.strong, {
      match: source => {
        return /^\*([\s\S]+?)\*(?!\*)/.exec(source) || /^'''([\s\S]+?)'''(?!''')/.exec(source);
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.strong} selectable={true}>{output(node.content)}</Text>;
      }
    }),

    monospace: Object.assign({}, SimpleMarkdown.defaultRules.strong, {
      match: source => {
        return /^{{([\s\S]+?)}}(?!}})/.exec(source) || /^{monospace}([\s\S]+?){monospace}(?!{monospace})/.exec(source);
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.monospace} selectable={true}>{output(node.content)}</Text>;
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
        return <Text key={state.key} style={styles.heading} selectable={true}>{output(node.content)}{'\n'}</Text>;
      }
    },

    underline: Object.assign({}, SimpleMarkdown.defaultRules.u, {
      match: source => /^\+([\s\S]+?)\+(?!\+)/.exec(source),

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.underline} selectable={true}>{output(node.content)}</Text>;
      }
    }),

    del: Object.assign({}, SimpleMarkdown.defaultRules.del, {
      match: source => /^--([\s\S]+?)--(?!--)/.exec(source),

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.del} selectable={true}>{output(node.content)}</Text>;
      }
    }),

    italic: Object.assign({}, SimpleMarkdown.defaultRules.em, {
      match: source => /^''([\s\S]+?)''(?!'')/.exec(source),

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.italic} selectable={true}>{output(node.content)}</Text>;
      }
    }),

    /**
     * NOTE: YT's wiki contains image names, not urls. Names should be first replaced with urls
     */
    image: Object.assign({}, SimpleMarkdown.defaultRules.image, {
      match: source => /^!(\S([\s\S]+?)\S)!(?!!)/.exec(source),

      parse: function(capture) {
        return {url: capture[CONTENT_WITHIN_MARKERS]};
      },

      react: (node, output, state) => {

        /**
         * Hack!!!
         * Android doesn't load image in wiki first time without this
         */
        if (Platform.OS === 'android') {
          const noop = () => {};
          Image.getSize(node.url, noop, noop);
        }


        return <Text onPress={() => actions.onImagePress(node.url)} key={state.key}>
          <Image
            source={{uri: `${node.url}&w=${imageWidth}&h=${imageHeight}`, width: 150, height: 150}}
            style={styles.image}/>
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
        return <Text key={state.key} style={styles.link} onPress={() => actions.onLinkPress(node.url)} selectable={true}>{node.content}</Text>;
      }
    }),

    issueIdLink: Object.assign({}, SimpleMarkdown.defaultRules.link, {
      match: source => /^\[ytmissue]([\s\S]+?)\|([\s\S]+?)\|([\S]+?)\[ytmissue](?!\[ytmissue])/.exec(source),
      parse: function(capture, parse, state) {
        const res = {
          issueId: capture[CONTENT_WITHIN_MARKERS],
          issueSummary: capture[2],
          isResolved: capture[3] === 'resolved'
        };
        return res;
      },

      react: (node, output, state) => {
        return <Text key={state.key}
                     style={[styles.link, node.isResolved ? styles.issueLinkResolved : {textDecorationLine: null}]}
                     selectable={true}
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
        return <Text key={state.key} style={[styles.link, {textDecorationLine: null}]} selectable={true}>{node.username}</Text>;
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
        return <Text key={state.key} style={styles.link} onPress={() => actions.onLinkPress(node.url)} selectable={true}>{node.url}</Text>;
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
        return <Text key={state.key} style={styles.codeBlock} selectable={true}>{node.content}</Text>;
      }
    }),

    blockQuote: Object.assign({}, SimpleMarkdown.defaultRules.blockQuote, {
      react: (node, output, state) => {
        return <View key={state.key} style={styles.blockQuote}>{output(node.content, state)}</View>;
      }
    }),

    inlineCode: Object.assign({}, SimpleMarkdown.defaultRules.inlineCode, {
      react: (node, output, state) => {
        return <Text key={state.key} style={styles.inlineCode} selectable={true}>{node.content}</Text>;
      }
    }),

    html: Object.assign({}, SimpleMarkdown.defaultRules.inlineCode, {
      match: source => /^\{html.*?}([\s\S]+?)\{html}(?!\{html})/.exec(source),

      parse: (capture, parse, state) => {
        return {
          content: capture[CONTENT_WITHIN_MARKERS]
        };
      },

      react: (node, output, state) => {
        return <Text key={state.key} style={styles.inlineCode} selectable={true}>{node.content}</Text>;
      }
    }),

    cut: Object.assign({}, SimpleMarkdown.defaultRules.em, {
      match: source => /^\{cut.*?}([\s\S]+?)\{cut}(?!\{cut})/.exec(source),

      parse: (capture, parse, state) => {
        return {
          content: capture[CONTENT_WITHIN_MARKERS]
        };
      },

      react: (node, output, state) => {
        const CUT_MAX_LENGTH = 3000;

        let cuttedContent = node.content;
        if (node.content.length > CUT_MAX_LENGTH) {
          cuttedContent = `${cuttedContent.substring(0, CUT_MAX_LENGTH)}... \n [content is too long]`;
        }
        return <Text key={state.key} style={styles.cutBlock} selectable={true}>{cuttedContent}</Text>;
      }
    })
  };
}
