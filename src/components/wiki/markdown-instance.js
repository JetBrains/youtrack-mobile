/* @flow */

import {MarkdownIt} from 'react-native-markdown-display';

function MarkdownItInstance() {
  return MarkdownIt({typographer: true, breaks: true});
}


export default new MarkdownItInstance();
