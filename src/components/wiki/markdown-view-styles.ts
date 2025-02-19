import {StyleSheet} from 'react-native';

import {DEFAULT_THEME} from 'components/theme/theme';
import {MAIN_FONT_SIZE, UNIT} from 'components/common-styles';

import type {UITheme, UIThemeColors} from 'types/Theme';
import type {TextStyleProp} from 'types/Internal';

const vSpace = {
  marginTop: UNIT * 2,
  marginBottom: UNIT,
};

const code = {
  borderWidth: 0,
  backgroundColor: DEFAULT_THEME.colors.$boxBackground,
  padding: UNIT,
  borderRadius: 4,
};

export const baseMarkdownStyles = {
  body: {
    color: DEFAULT_THEME.colors.$text,
    fontSize: MAIN_FONT_SIZE,
    lineHeight: MAIN_FONT_SIZE * 1.3,
  },
  heading1: {
    flexDirection: 'row',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: null,
    ...vSpace,
  },
  heading2: {
    flexDirection: 'row',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: null,
    ...vSpace,
  },
  heading3: {
    flexDirection: 'row',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: null,
    ...vSpace,
  },
  heading4: {
    flexDirection: 'row',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: null,
    ...vSpace,
  },
  heading5: {
    flexDirection: 'row',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: null,
    ...vSpace,
  },
  heading6: {
    flexDirection: 'row',
    fontSize: MAIN_FONT_SIZE - 5,
    fontWeight: '700',
    lineHeight: null,
    ...vSpace,
  },
  hr: {
    height: 1,
    marginHorizontal: 0,
    backgroundColor: DEFAULT_THEME.colors.$textSecondary,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  s: {
    textDecorationLine: 'line-through',
  },
  blockquote: {
    margin: 0,
    padding: 0,
    paddingLeft: UNIT * 1.5,
    backgroundColor: 'transparent',
    borderLeftColor: DEFAULT_THEME.colors.$iconAccent,
    borderLeftWidth: 2,
  },
  blockquoteText: {
    fontSize: MAIN_FONT_SIZE,
  },
  bullet_list: {},
  ordered_list: {},
  list_item: {},

  bullet_list_icon: {
    marginTop: UNIT,
  },
  bullet_list_icon_checkbox: {
    color: 'transparent',
  },

  bullet_list_content: {
    flex: 1,
    flexWrap: 'wrap',
  },

  ordered_list_icon: {
    marginTop: UNIT,
    marginHorizontal: UNIT,
  },

  ordered_list_content: {},
  code_inline: {...code},
  code_block: {...code},
  fence: {...code},
  table: {
    borderWidth: 1,
    borderColor: DEFAULT_THEME.colors.$text,
    borderRadius: 3,
  },
  thead: {},
  tbody: {},
  th: {
    flex: 1,
    padding: 5,
    width: 120,
  },
  tr: {
    borderColor: DEFAULT_THEME.colors.$text,
    flexDirection: 'row',
  },
  td: {
    flex: 1,
    padding: 5,
    width: 120,
  },
  link: {
    textDecorationLine: 'none',
    color: DEFAULT_THEME.colors.$link,
  },
  blocklink: {
    flex: 1,
    borderColor: DEFAULT_THEME.colors.$text,
    borderBottomWidth: 1,
  },
  image: {
    flex: 1,
  },
  text: {
    color: DEFAULT_THEME.colors.$text,
  },
  textgroup: {},
  paragraph: {
    marginTop: UNIT,
    marginBottom: 0,
  },
  hardbreak: {
    width: '100%',
    height: 1,
  },
  softbreak: {},

  pre: {},
  inline: {},
  span: {},
};

const markdownStyles = (
  uiTheme: UITheme = DEFAULT_THEME,
  textStyle: TextStyleProp = {}
): StyleSheet.NamedStyles<any> => {
  const uiThemeColors: UIThemeColors = uiTheme.colors;
  return {
    ...baseMarkdownStyles,
    body: {
      ...baseMarkdownStyles.body,
      color: uiThemeColors.$text,
      ...textStyle,
    },
    hr: {
      ...baseMarkdownStyles.hr,
      backgroundColor: uiThemeColors.$textSecondary,
    },
    blockquote: {
      ...baseMarkdownStyles.blockquote,
      borderLeftColor: uiThemeColors.$iconAccent,
    },
    code_inline: {...code, backgroundColor: uiThemeColors.$boxBackground},
    code_block: {...code, backgroundColor: uiThemeColors.$boxBackground},
    fence: {...code, backgroundColor: uiThemeColors.$boxBackground},
    table: {...baseMarkdownStyles.table, borderColor: uiThemeColors.$text},
    tr: {...baseMarkdownStyles.tr, borderColor: uiThemeColors.$text},
    link: {...baseMarkdownStyles.link, color: uiThemeColors.$link},
    blocklink: {
      ...baseMarkdownStyles.blocklink,
      borderColor: uiThemeColors.$text,
    },
    text: {
      ...baseMarkdownStyles.text,
      ...textStyle,
      color: uiThemeColors.$text,
    },
    textgroup: {...baseMarkdownStyles.textgroup},
    paragraph: {...baseMarkdownStyles.paragraph},
    hardbreak: {...baseMarkdownStyles.hardbreak},
    softbreak: {...baseMarkdownStyles.softbreak},
    pre: {...baseMarkdownStyles.pre},
    inline: {...baseMarkdownStyles.inline},
    span: {...baseMarkdownStyles.span},
  };
};

export default markdownStyles;
