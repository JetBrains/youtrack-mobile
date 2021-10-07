/* @flow */

import {MarkdownIt} from 'react-native-markdown-display';

function MarkdownItInstance() {
  const markdownIt: MarkdownIt = MarkdownIt({typographer: true, breaks: true, linkify: true});
  markdownIt.use(require('markdown-it-checkbox'), {});
  markdownIt.use(require('markdown-it-inline-comments'));
  return markdownIt;
}


export default (new MarkdownItInstance(): any);
