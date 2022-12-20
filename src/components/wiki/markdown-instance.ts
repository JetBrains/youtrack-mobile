import {MarkdownIt} from 'react-native-markdown-display';

function MarkdownItInstance() {
  const markdownIt: typeof MarkdownIt = MarkdownIt({
    typographer: true,
    breaks: true,
    linkify: true,
    html: true,
  })
    .use(require('markdown-it-checkbox'), {})
    .use(require('markdown-it-inline-comments'))
    .enable('table')
    .enable('strikethrough');
  return markdownIt;
}

export default new MarkdownItInstance();