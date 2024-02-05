import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE, mainText, monospace, SECONDARY_FONT_SIZE, UNIT} from 'components/common-styles';

const link = {
  color: '$link',
};
export default EStyleSheet.create({
  codeToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: UNIT,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '$boxBackground',
    backgroundColor: '$background',
    borderTopLeftRadius: UNIT,
    borderTopRightRadius: UNIT,
  },
  codeToolbarButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeToolbarButton: {
    marginHorizontal: UNIT,
    padding: UNIT / 2,
  },
  codeToolbarIcon: {
    color: '$iconAction',
  },
  codeToolbarText: {
    color: '$text',
  },
  htmlView: {
    color: '$text',
    textAlign: 'left',
    writingDirection: 'ltr',
    ...Platform.select({
      android: {
        borderBottomWidth: UNIT,
        borderColor: 'transparent',
      },
      ios: {
        fontSize: MAIN_FONT_SIZE,
      },
    }),
  },
  lineSpace: {
    lineHeight: 30,
  },
  monospace,
  deleted: {
    textDecorationLine: 'line-through',
  },
  link,
  text: {
    color: '$text',
  },
  showMoreLink: {
    ...link,
    lineHeight: SECONDARY_FONT_SIZE * 2,
  },
  exceptionLink: link,
  codeContainer: {
    marginVertical: UNIT,
  },
  codeScrollContainer: {
    padding: UNIT,
    paddingRight: 0,
    borderColor: '$boxBackground',
    backgroundColor: '$boxBackground',
    borderBottomLeftRadius: UNIT,
    borderBottomRightRadius: UNIT,
    minHeight: UNIT * 7,
  },
  codeScrollContent: {
    paddingLeft: UNIT / 2,
    paddingRight: UNIT * 1.5,
    alignItems: 'center',
  },
  code: {...monospace, fontWeight: '500'},
  codeLanguage: {
    color: '$textSecondary',
  },
  inlineCode: {
    ...monospace,
    backgroundColor: '$boxBackground',
    color: '$text',
  },
  exception: {
    ...monospace,
    padding: 0,
    color: '$text',
    lineHeight: mainText.lineHeight,
  },
  checkboxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  checkboxIconContainer: {
    position: 'absolute',
    left: -28,
    backgroundColor: '$background',
  },
  checkboxIcon: link,
  checkboxIconBlank: {
    color: '$icon',
  },
  checkboxTextGroup: {
    flexDirection: 'row',
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: '80%',
  },
  video: {
    width: 315,
    height: 240,
    alignSelf: 'stretch',
  },
});
export const htmlViewStyles = EStyleSheet.create({
  a: {
    ...link,
    textDecorationLine: 'underline',
  },
});
