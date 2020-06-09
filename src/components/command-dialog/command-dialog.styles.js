import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_MEDIUM_GRAY,
  COLOR_FONT
} from '../variables/variables';
import {mainText} from '../common-styles/typography';
import {elevation1} from '../common-styles/shadow';

export default StyleSheet.create({
  modal: {
    backgroundColor: COLOR_FONT_ON_BLACK,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: UNIT,
    paddingRight: UNIT,
  },
  suggestionsList: {
    overflow: 'visible',
    paddingTop: UNIT * 2
  },
  inputWrapper: {
    ...elevation1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: UNIT * 1.5,
    backgroundColor: COLOR_FONT_ON_BLACK,
  },
  searchInput: {
    ...mainText,
    flex: 1,
    height: UNIT * 5,
    margin: UNIT,
    color: COLOR_FONT
  },
  suggestion: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionDescription: {
    flex: 0.5,
    marginRight: UNIT,
    ...mainText
  },
  suggestionText: {
    ...mainText,
    flex: 1,
    fontWeight: '500',
    color: COLOR_BLACK
  },
  commandPreview: {
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 2,
    marginLeft: UNIT,
    marginRight: UNIT,
    borderBottomColor: COLOR_MEDIUM_GRAY,
    borderBottomWidth: 0.5,
  },
  commandDescription: {
    color: COLOR_BLACK
  },
  commandDescriptionError: {
    color: 'red'
  },
  applyButton: {
    paddingRight: UNIT
  }
});
