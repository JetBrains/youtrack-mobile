/* @flow */

import {MarkdownIt} from 'react-native-markdown-display';

function MarkdownItInstance() {
  const markdownItInstance: MarkdownIt = MarkdownIt({typographer: true, breaks: true, linkify: true});
  markdownItInstance.linkify.set({fuzzyEmail: false, fuzzyLink: true});
  return markdownItInstance;
}


export default new MarkdownItInstance();
