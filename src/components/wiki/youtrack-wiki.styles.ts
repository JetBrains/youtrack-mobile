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
  bulletListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletListMarker: {
    color: '$text',
    fontSize: MAIN_FONT_SIZE,
    // Same line box as the text's first line, so the marker's glyph centers on that
    // line; alignSelf keeps it pinned to the first line instead of stretching across
    // the whole (possibly multi-line) item.
    lineHeight: MAIN_FONT_SIZE * 1.3,
    alignSelf: 'flex-start',
    marginLeft: UNIT / 2,
    marginRight: UNIT,
  },
  // Applied only when the list item keeps its wrapping paragraph (loose lists / AST
  // input): matches the paragraph's own marginTop so the marker and the first text
  // line start at the same Y. String input strips the paragraph, so no top margin.
  bulletListMarkerSpaced: {
    marginTop: UNIT,
  },
  bulletListContent: {
    flex: 1,
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
  // Top spacing between checkbox list items. The library's paragraph provides this for
  // loose/AST lists; string input strips the paragraph, so we add it back here.
  checkboxListItemSpaced: {
    marginTop: UNIT,
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
