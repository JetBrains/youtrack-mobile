import {Platform} from 'react-native';
import {DEFAULT_THEME} from '../theme/theme';
import {UNIT} from 'components/variables';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE} from 'components/common-styles/typography';
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
    fontSize: SECONDARY_FONT_SIZE,
  },
  heading1: {
    flexDirection: 'row',
    fontSize: 32,
    lineHeight: null,
    ...vSpace,
  },
  heading2: {
    flexDirection: 'row',
    fontSize: 24,
    lineHeight: null,
    ...vSpace,
  },
  heading3: {
    flexDirection: 'row',
    fontSize: 20,
    lineHeight: null,
    ...vSpace,
  },
  heading4: {
    flexDirection: 'row',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    lineHeight: null,
    ...vSpace,
  },
  heading5: {
    flexDirection: 'row',
    fontSize: 13,
    lineHeight: null,
    ...vSpace,
  },
  heading6: {
    flexDirection: 'row',
    fontSize: 11,
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
  bullet_list: {},
  ordered_list: {},
  list_item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  // @pseudo class, does not have a unique render rule
  bullet_list_icon: {
    marginLeft: UNIT * 3,
    marginRight: UNIT * 1.5,
    ...Platform.select({
      ios: {
        fontSize: 30,
        lineHeight: 32,
      },
      android: {
        fontSize: MAIN_FONT_SIZE,
        lineHeight: 28,
      },
      default: {
        marginTop: 0,
        lineHeight: 30,
      },
    }),
  },
  bullet_list_icon_checkbox: {
    color: 'transparent',
    marginLeft: -14,
  },
  // @pseudo class, does not have a unique render rule
  bullet_list_content: {
    flex: 1,
    flexWrap: 'wrap',
  },
  // @pseudo class, does not have a unique render rule
  ordered_list_icon: {
    marginLeft: UNIT,
    marginRight: UNIT,
    ...Platform.select({
      android: {
        lineHeight: 27,
      },
      ios: {
        lineHeight: 33,
      },
      default: {
        lineHeight: 33,
      },
    }),
  },
  // @pseudo class, does not have a unique render rule
  ordered_list_content: {
    flex: 1,
    flexWrap: 'wrap',
  },
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
  },
  tr: {
    // borderBottomWidth: 1,
    borderColor: DEFAULT_THEME.colors.$text,
    flexDirection: 'row',
  },
  td: {
    flex: 1,
    padding: 5,
  },
  link: {
    textDecorationLine: 'none',
    color: DEFAULT_THEME.colors.$link,
  },
  blocklink: {
    flex: 1,
    borderColor: DEFAULT_THEME.colors.$text,
    borderBottomWidth: 1,
    backgroundColor: 'yellow',
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
    marginBottom: UNIT,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  hardbreak: {
    width: '100%',
    height: 1,
  },
  softbreak: {},
  // Believe these are never used but retained for completeness
  pre: {},
  inline: {},
  span: {},
};

const markdownStyles = (
  uiTheme: UITheme = DEFAULT_THEME,
  textStyle: TextStyleProp = {},
) => {
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
