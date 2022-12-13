import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {MAIN_FONT_SIZE, mainText, monospace, SECONDARY_FONT_SIZE} from '../common-styles/typography';

const showMoreLink = {
  fontSize: SECONDARY_FONT_SIZE,
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
    borderTopLeftRadius: UNIT,
    borderTopRightRadius: UNIT,
  },
  codeToolbarButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeToolbarButton: {
    marginLeft: UNIT,
    padding: UNIT,
  },
  codeToolbarIcon: {
    color: '$iconAccent',
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
  unspaced: {
    margin: 0,
  },
  link: {
    color: '$link',
    fontSize: SECONDARY_FONT_SIZE,
    marginTop: UNIT / 4,
  },
  text: {
    color: '$link',
    fontSize: SECONDARY_FONT_SIZE,
  },
  showMoreLink: {
    ...showMoreLink,
    lineHeight: SECONDARY_FONT_SIZE * 2,
    fontSize: SECONDARY_FONT_SIZE,
  },
  exceptionLink: showMoreLink,
  codeContainer: {
    marginVertical: UNIT,
  },
  codeScrollContainer: {
    padding: UNIT,
    paddingRight: 0,
    backgroundColor: '$boxBackground',
    borderBottomLeftRadius: UNIT,
    borderBottomRightRadius: UNIT,
  },
  codeScrollContent: {
    paddingLeft: UNIT / 2,
    paddingRight: UNIT * 1.5,
  },
  code: {
    ...monospace,
    fontSize: SECONDARY_FONT_SIZE,
    fontWeight: '500',
  },
  codeLanguage: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$icon',
  },
  inlineCode: {
    ...monospace,
    backgroundColor: '$boxBackground',
    color: '$text',
    fontSize: SECONDARY_FONT_SIZE,
  },
  exception: {
    ...monospace,
    padding: 0,
    color: '$text',
    fontSize: SECONDARY_FONT_SIZE,
    lineHeight: mainText.lineHeight,
  },
  checkboxRow: {
    flex: 0.96,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: -UNIT / 2,
    marginRight: UNIT / 2,
  },
  checkboxIcon: {
    flexGrow: 0,
    color: '$link',
    padding: UNIT / 2,
    paddingRight: UNIT / 4,
    marginRight: UNIT,
    ...Platform.select({
      ios: {
        marginTop: -UNIT / 4,
      },
      android: {
        marginTop: 0,
      },
    }),
  },
  checkboxIconBlank: {
    color: '$icon',
  },
  checkboxLabel: {
    marginTop: 6,
  },
  checkboxTextGroup: {
    flexDirection: 'row',
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
    color: '$link',
    textDecorationLine: 'underline',
  },
});
