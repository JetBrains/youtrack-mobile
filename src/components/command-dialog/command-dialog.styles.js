import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_TRANSPARENT_BLACK,
  COLOR_BLACK,
  COLOR_SELECTED_DARK,
  COLOR_PINK,
  COLOR_FONT_ON_BLACK,
  COLOR_PLACEHOLDER
} from '../../components/variables/variables';

export default StyleSheet.create({
  modal: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  animatedListContainer: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: COLOR_TRANSPARENT_BLACK
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  suggestionsList: {
    overflow: 'visible',
    paddingTop: UNIT * 2
  },

  headerText: {
    fontSize: 17,
    color: COLOR_FONT_ON_BLACK
  },

  inputWrapper: {
    backgroundColor: COLOR_BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchInput: {
    flex: 1,
    height: UNIT * 4.5,
    borderRadius: 6,
    backgroundColor: COLOR_SELECTED_DARK,
    margin: UNIT,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: UNIT,
    color: COLOR_PINK,
    fontSize: 15
  },
  keyboardSpacer: {
    backgroundColor: COLOR_BLACK
  },
  applyButton: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  applyText: {
    fontSize: 16,
    color: COLOR_PINK
  },
  applyTextDisabled: {
    color: COLOR_PLACEHOLDER
  },
  suggestionRow: {
    flex: 1,
    flexDirection: 'row',
    padding: UNIT * 2,
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    paddingRight: UNIT
  },
  suggestionDescriptionContainer: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: UNIT * 2
  },
  suggestionDescription: {
    fontSize: 16,
    color: COLOR_PLACEHOLDER
  },
  suggestionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexGrow: 2,
    flexShrink: 0
  },
  suggestionText: {
    fontSize: 24,
    fontWeight: '300',
    color: COLOR_FONT_ON_BLACK
  },
  commandPreview: {
    width: '100%',
    padding: UNIT * 2,
    paddingTop: UNIT / 2,
    backgroundColor: COLOR_TRANSPARENT_BLACK
  },
  commandDescription: {
    color: COLOR_FONT_ON_BLACK
  },
  commandDescriptionError: {
    color: 'red'
  }
});
