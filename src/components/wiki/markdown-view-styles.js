/* @flow */

import {Platform} from 'react-native';

import {
  COLOR_BLACK,
  COLOR_FONT,
  COLOR_FONT_GRAY,
  COLOR_GRAY,
  COLOR_LINK,
  UNIT
} from '../variables/variables';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE} from '../common-styles/typography';


const vSpace = {
  marginTop: UNIT * 2,
  marginBottom: UNIT
};

// Source: 'react-native-markdown-display/src/lib/styles'
const markdownStyles = {
  // The main container
  body: {
    fontSize: SECONDARY_FONT_SIZE,
    color: COLOR_BLACK,
  },

  // Headings
  heading1: {
    flexDirection: 'row',
    fontSize: 32,
    ...vSpace
  },
  heading2: {
    flexDirection: 'row',
    fontSize: 24,
    ...vSpace
  },
  heading3: {
    flexDirection: 'row',
    fontSize: 18,
    ...vSpace
  },
  heading4: {
    flexDirection: 'row',
    fontSize: 16,
    ...vSpace
  },
  heading5: {
    flexDirection: 'row',
    fontSize: 13,
    ...vSpace
  },
  heading6: {
    flexDirection: 'row',
    fontSize: 11,
    ...vSpace
  },

  // Horizontal Rule
  hr: {
    backgroundColor: COLOR_FONT_GRAY,
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
    backgroundColor: COLOR_FONT,
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
    borderWidth: 1,
    borderColor: COLOR_GRAY,
    padding: 10,
    borderRadius: 4,
  },
  code_block: {
    borderWidth: 1,
    borderColor: COLOR_GRAY,
    padding: 10,
    borderRadius: 4,
  },
  fence: {
    borderWidth: 1,
    borderColor: COLOR_GRAY,
    padding: 10,
    borderRadius: 4,
  },

  // Tables
  table: {
    borderWidth: 1,
    borderColor: COLOR_BLACK,
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
    borderColor: COLOR_BLACK,
    flexDirection: 'row',
  },
  td: {
    flex: 1,
    padding: 5,
  },

  // Links
  link: {
    textDecorationLine: 'none',
    color: COLOR_LINK
  },
  blocklink: {
    flex: 1,
    borderColor: COLOR_BLACK,
    borderBottomWidth: 1,
  },

  // Images
  image: {
    flex: 1,
  },

  // Text Output
  text: {},
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

export default markdownStyles;
