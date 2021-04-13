/* @flow */

export function updateMarkdownCheckbox(md: string, index: number, checked: boolean): string {
  let counter = -1;
  return md.replace(/(?:[-*]\s)(\[(x|\s)\])/ig, (matched: string) => {
    counter++;
    if (index === counter) {
      return matched.slice(0, 2) + (checked ? '[x]' : '[ ]');
    }
    return matched;
  });
}
