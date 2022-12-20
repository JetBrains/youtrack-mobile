export const mdCheckboxRegex = /(?:[-*]\s)(\[(x|\s)\])/gi;
export const htmlTagRegex = /<\/?[^>]+(>|$)/gi;
export const whiteSpacesInHTMLRegex: RegExp = />\s+</g;
export const whiteSpacesRegex: RegExp = /\s+/g;
export const linebreakRegex: RegExp = /(\r\n|\r|\n)/g;
export const htmlCodeStartRegex: RegExp = /^{html}/;
export const htmlCodeEndRegex: RegExp = /{html}$/;
export function createMentionRegExp(mention: string): RegExp {
  const punctuationMarks = ['.', ',', '!', ':', '\\-'].join('');
  const prefix = `(?:[\\s${punctuationMarks}([]|^)`;
  const suffix = `(?=[\\s${punctuationMarks})\\]]|$)`;
  return new RegExp(`${prefix}${mention}${suffix}`, 'ig');
}
