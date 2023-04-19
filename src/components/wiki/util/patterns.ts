export const mdCheckboxRegex = /(?:[-*]\s)(\[(x|\s)\])/gi;
export const htmlTagRegex = /<\/?[^>]+(>|$)/gi;
export const whiteSpacesInHTMLRegex: RegExp = />\s+</g;
export const whiteSpacesRegex: RegExp = /\s+/g;
export const linebreakRegex: RegExp = /(\r\n|\r|\n)/g;
export const htmlCodeStartRegex: RegExp = /^{html}/;
export const htmlCodeEndRegex: RegExp = /{html}$/;

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createUserMentionRegexp(mention: string): RegExp {
  const wrappingMarks = [',', '?', '!', ':', '\\-', '#'].join('');
  const prefix = `(?:[\\s.${wrappingMarks}([]|^)`;
  const suffix = `(?=(\\.\\s)|(\\.$)|[\\s${wrappingMarks})\\]]|$)`;
  return new RegExp(`${prefix}${escapeRegExp(mention)}${suffix}`, 'igu');
}

export function createMentionRegExp(mention: string): RegExp {
  const punctuationMarks = ['.', ',', '?', '!', ':', '#'].join('');
  const prefix = `(?:[\\s${punctuationMarks}([]|^)`;
  const suffix = `(?=[\\s${punctuationMarks})\\]]|$)`;
  return new RegExp(`${prefix}${escapeRegExp(mention)}${suffix}`, 'igu');
}

