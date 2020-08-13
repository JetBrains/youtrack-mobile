import {StyleSheet} from 'react-native';
import {
  COLOR_LINK,
  COLOR_FONT,
  UNIT,
  COLOR_FONT_GRAY,
  COLOR_PINK,
  COLOR_LIGHT_GRAY, COLOR_BLACK
} from '../variables/variables';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE, monospace} from '../common-styles/typography';
import {link} from '../common-styles/button';

const showMoreLink = {
  marginBottom: UNIT * 2,
  fontFamily: 'System',
  fontSize: SECONDARY_FONT_SIZE,
  textAlign: 'center',
  color: COLOR_PINK
};

export default StyleSheet.create({
  htmlView: {
    fontSize: MAIN_FONT_SIZE,
    color: COLOR_FONT,
    textAlign: 'left',
    writingDirection: 'ltr'
  },
  lineSpace: {
    lineHeight: 30
  },
  monospace: {
    ...monospace
  },
  deleted: {
    textDecorationLine: 'line-through'
  },
  blockQuote: {
    color: COLOR_FONT_GRAY,
    borderLeftWidth: 2,
    borderLeftColor: COLOR_FONT_GRAY,
    paddingLeft: UNIT
  },
  unspaced: {
    margin: 0
  },
  link: {
    ...link,
    fontSize: SECONDARY_FONT_SIZE,
  },
  text: {
    ...link,
    fontSize: SECONDARY_FONT_SIZE,
  },
  codeLink: showMoreLink,
  exceptionLink: showMoreLink,
  codeContainer: {
    paddingLeft: UNIT * 2,
    backgroundColor: COLOR_LIGHT_GRAY
  },
  code: {
    ...monospace,
    fontSize: SECONDARY_FONT_SIZE,
    fontWeight: '500',
  },
  inlineCode: {
    ...monospace,
    fontSize: SECONDARY_FONT_SIZE,
    color: COLOR_BLACK,
    lineHeight: SECONDARY_FONT_SIZE * 2,
    backgroundColor: COLOR_LIGHT_GRAY
  },
  exception: {
    ...monospace,
    marginTop: UNIT,
    marginBottom: UNIT * 3,
    fontSize: SECONDARY_FONT_SIZE,
    color: COLOR_FONT
  },

});

export const htmlViewStyles = StyleSheet.create({
  a: {
    color: COLOR_LINK,
    textDecorationLine: 'underline'
  }
});
