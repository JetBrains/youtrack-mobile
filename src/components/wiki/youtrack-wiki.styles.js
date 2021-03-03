import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE, monospace, mainText} from '../common-styles/typography';

const showMoreLink = {
  fontSize: SECONDARY_FONT_SIZE,
  color: '$link'
};

export default EStyleSheet.create({
  htmlView: {
    color: '$text',
    textAlign: 'left',
    writingDirection: 'ltr',
    ...Platform.select({
      android: {
        borderBottomWidth: UNIT,
        borderColor: 'transparent'
      },
      ios: {
        fontSize: MAIN_FONT_SIZE,
      }
    })
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
    color: '$textSecondary',
    borderLeftWidth: 2,
    borderLeftColor: '$textSecondary',
    paddingLeft: UNIT
  },
  unspaced: {
    margin: 0
  },
  link: {
    color: '$link',
    fontSize: SECONDARY_FONT_SIZE,
  },
  text: {
    color: '$link',
    fontSize: SECONDARY_FONT_SIZE,
  },
  showMoreLink: {
    ...showMoreLink,
    lineHeight: SECONDARY_FONT_SIZE * 2,
    fontSize: SECONDARY_FONT_SIZE
  },
  exceptionLink: showMoreLink,
  codeContainer: {
    marginTop: UNIT * 2,
    marginBottom: UNIT
  },
  codeContent: {
    padding: UNIT,
    backgroundColor: '$boxBackground'
  },
  code: {
    ...monospace,
    fontSize: SECONDARY_FONT_SIZE,
    fontWeight: '500',
  },
  codeLanguage: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$icon'
  },
  inlineCode: {
    ...monospace,
    backgroundColor: '$boxBackground',
    color: '$text',
    fontSize: SECONDARY_FONT_SIZE,
    lineHeight: mainText.lineHeight,
  },
  exception: {
    ...monospace,
    padding: 0,
    color: '$text',
    fontSize: SECONDARY_FONT_SIZE,
    lineHeight: mainText.lineHeight,
  },

});

export const htmlViewStyles = EStyleSheet.create({
  a: {
    color: '$link',
    textDecorationLine: 'underline'
  }
});
