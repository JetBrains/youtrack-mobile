/* @flow */

import {Platform} from 'react-native';

import {UNIT} from '../variables/variables';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE} from '../common-styles/typography';
import type {UITheme, UIThemeColors} from '../../flow/Theme';


const vSpace = {
  marginTop: UNIT * 2,
  marginBottom: UNIT,
};

// Source: 'react-native-markdown-display/src/lib/styles'
const markdownStyles = (uiTheme: UITheme) => {
  const uiThemeColors: UIThemeColors = uiTheme.colors;
  const code = {
    borderWidth: 0,
    backgroundColor: uiThemeColors.$boxBackground,
    padding: UNIT,
    borderRadius: 4,
  };

  return {
    // The main container
    body: {
      color: uiThemeColors.$text,
      fontSize: SECONDARY_FONT_SIZE,
    },

    // Headings
    heading1: {
      flexDirection: 'row',
      fontSize: 32,
      ...vSpace,
    },
    heading2: {
      flexDirection: 'row',
      fontSize: 24,
      ...vSpace,
    },
    heading3: {
      flexDirection: 'row',
      fontSize: 18,
      ...vSpace,
    },
    heading4: {
      flexDirection: 'row',
      fontSize: 16,
      ...vSpace,
    },
    heading5: {
      flexDirection: 'row',
      fontSize: 13,
      ...vSpace,
    },
    heading6: {
      flexDirection: 'row',
      fontSize: 11,
      ...vSpace,
    },

    // Horizontal Rule
    hr: {
      backgroundColor: uiThemeColors.$textSecondary,
      height: 1,
    },

    // Emphasis
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    s: {
      textDecorationLine: 'line-through',
    },

    // Blockquotes
    blockquote: {
      paddingHorizontal: 14,
      paddingVertical: 4,
      backgroundColor: uiThemeColors.$text,
    },

    // Lists
    bullet_list: {},
    ordered_list: {},
    list_item: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    // @pseudo class, does not have a unique render rule
    bullet_list_icon: {
      marginLeft: UNIT,
      marginRight: UNIT / 2,
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
    },
    // @pseudo class, does not have a unique render rule
    bullet_list_content: {
      flex: 1,
      flexWrap: 'wrap',
    },
    // @pseudo class, does not have a unique render rule
    ordered_list_icon: {
      marginLeft: UNIT,
      marginRight: UNIT / 2,
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

    // Code
    code_inline: {
      ...code,
    },
    code_block: {
      ...code,
    },
    fence: {
      ...code,
    },

    // Tables
    table: {
      borderWidth: 1,
      borderColor: uiThemeColors.$text,
      borderRadius: 3,
    },
    thead: {},
    tbody: {},
    th: {
      flex: 1,
      padding: 5,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: uiThemeColors.$text,
      flexDirection: 'row',
    },
    td: {
      flex: 1,
      padding: 5,
    },

    // Links
    link: {
      textDecorationLine: 'none',
      color: uiThemeColors.$link,
    },
    blocklink: {
      flex: 1,
      borderColor: uiThemeColors.$text,
      borderBottomWidth: 1,
    },

    // Images
    image: {
      flex: 1,
    },

    // Text Output
    text: {
      color: uiThemeColors.$text,
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
};

export default markdownStyles;
