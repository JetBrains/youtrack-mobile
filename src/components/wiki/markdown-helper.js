/* @flow */

import {sanitizeRawHTML} from './markdown-html-sanitize';

const mdCheckboxRegex = /(?:[-*]\s)(\[(x|\s)\])/ig;
const multiWhiteSpacesRegex = /\s{2,}/gi;
const multiHTMLWhiteSpacesRegex = />\s+</g;


export function updateMarkdownCheckbox(md: string, index: number, checked: boolean): string {
  let counter = -1;
  return md.replace(mdCheckboxRegex, (matched: string) => {
    counter++;
    if (index === counter) {
      return matched.slice(0, 2) + (checked ? '[x]' : '[ ]');
    }
    return matched;
  });
}

export function prepareMarkdown(md: string = ''): string {
  return sanitizeRawHTML(
    md.replace(multiWhiteSpacesRegex, ' ').replace(multiHTMLWhiteSpacesRegex, '><')
  );
}
