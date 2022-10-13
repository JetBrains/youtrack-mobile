/* @flow */

import {MarkdownIt} from 'react-native-markdown-display';


export default (
  (new MarkdownIt('commonmark', {typographer: true, breaks: true, linkify: true, html: true})
    .use(require('markdown-it-checkbox'), {})
    .use(require('markdown-it-inline-comments'))
    .enable('table')): typeof MarkdownIt
);
