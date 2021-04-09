/* @flow */

import {MarkdownIt} from 'react-native-markdown-display';

function MarkdownItInstance() {
  const markdownIt: MarkdownIt = MarkdownIt({typographer: true, breaks: true});
  markdownIt.use(require('markdown-it-checkbox'), {});
  return markdownIt;
}


export default new MarkdownItInstance();
