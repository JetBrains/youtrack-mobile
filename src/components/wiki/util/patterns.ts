const htmlCodeEndRegex: RegExp = /{html}$/;
const htmlCodeStartRegex: RegExp = /^{html}/;
const htmlTagRegex = /<\/?[^>]+(>|$)/gi;
const issueIdRegExp: RegExp = /([a-zA-Z]+-)+\d+/g;
const linebreakRegex: RegExp = /(\r\n|\r|\n)/g;
const mdCheckboxRegex = /(?:[-*]\s)(\[(x|\s)\])/gi;
const whiteSpacesInHTMLRegex: RegExp = />\s+</g;
const whiteSpacesRegex: RegExp = /\s+/g;
const imageEmbedRegExp: RegExp = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
const imageHeight: RegExp = /{height=\d+(%|px)?}/i;
const imageWidth: RegExp = /{width=\d+(%|px)?}/i;

const escapeRegExp = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const usrWrappingMarks = [',', '?', '!', ':', '\\-', '#'].join('');
const usrPrefix = `(?:[\\s.${usrWrappingMarks}([]|^)`;
const usrSuffix = `(?=(\\.\\s)|(\\.$)|[\\s${usrWrappingMarks})\\]]|$)`;
const createUserMentionRegexp = (mention: string): RegExp => {
  return new RegExp(`${usrPrefix}${escapeRegExp(mention)}${usrSuffix}`, 'igu');
};

const createMentionRegExp = (mention: string): RegExp => {
  const punctuationMarks = ['.', ',', '?', '!', ':', '#', '_'].join('');
  const prefix = `(?:[\\s${punctuationMarks}([]|^)`;
  const suffix = `(?=[\\s${punctuationMarks})\\]]|$)`;
  return new RegExp(`${prefix}${escapeRegExp(mention)}${suffix}`, 'igu');
};

export {
  createMentionRegExp,
  createUserMentionRegexp,
  escapeRegExp,
  htmlCodeEndRegex,
  htmlCodeStartRegex,
  htmlTagRegex,
  imageEmbedRegExp,
  imageHeight,
  imageWidth,
  issueIdRegExp,
  linebreakRegex,
  mdCheckboxRegex,
  whiteSpacesInHTMLRegex,
  whiteSpacesRegex,
};
