import * as patterns from './util/patterns';
import {MarkdownNode} from 'types/Markdown';
export function isPureHTMLBlock(md: string | null) {
  const text: string = (md || '').toLowerCase().trim();
  return (
    (text.startsWith('<html') || text.startsWith('{html}')) &&
    (text.endsWith('</html>') || text.endsWith('{html}'))
  );
}
export function updateMarkdownCheckbox(
  md: string,
  index: number,
  checked: boolean,
): string {
  let counter = -1;
  return md.replace(patterns.mdCheckboxRegex, (matched: string) => {
    counter++;

    if (index === counter) {
      return matched.slice(0, 2) + (checked ? '[x]' : '[ ]');
    }

    return matched;
  });
}
export function prepareHTML(md: string = ''): string {
  const str: string = md.replace(patterns.htmlTagRegex, (s: string) => {
    return s
      .replace(patterns.whiteSpacesInHTMLRegex, '><')
      .replace(patterns.whiteSpacesRegex, ' ')
      .replace(patterns.linebreakRegex, '<br>');
  });
  return str
    .replace(patterns.whiteSpacesInHTMLRegex, '><')
    .replace(patterns.htmlCodeStartRegex, '')
    .replace(patterns.htmlCodeEndRegex, '');
}

export function isMarkdownNodeContainsCheckbox(node: MarkdownNode): boolean {
  let hasCheckbox: boolean = false;
  let nodeChildren: MarkdownNode[] = node.children || [];

  while (nodeChildren?.length > 0) {
    hasCheckbox = nodeChildren.some(it => it.type === 'checkbox');
    if (hasCheckbox) {
      break;
    }
    nodeChildren = nodeChildren[0] && nodeChildren[0].children;
  }

  return hasCheckbox;
}
