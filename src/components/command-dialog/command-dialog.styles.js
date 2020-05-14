import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_ICON_MEDIUM_GREY, COLOR_MEDIUM_GRAY
} from '../variables/variables';
import {formStyles} from '../common-styles/form';
import {mainText} from '../common-styles/issue';

export default StyleSheet.create({
  modal: {
    backgroundColor: COLOR_FONT_ON_BLACK,
    paddingLeft: UNIT,
    paddingRight: UNIT,
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
  headerText: {
    fontSize: 17,
    color: COLOR_FONT_ON_BLACK
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UNIT,
  },
  searchInput: {
    ...formStyles.input,
  },
  suggestionRow: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 2,
    borderBottomColor: COLOR_MEDIUM_GRAY,
    borderBottomWidth: 0.5,
  },
  suggestionDescriptionContainer: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    marginRight: UNIT * 2,
  },
  suggestionDescription: {
    ...mainText,
    color: COLOR_ICON_MEDIUM_GREY
  },
  suggestionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexGrow: 2,
    flexShrink: 0
  },
  suggestionText: {
    ...mainText,
    fontWeight: '300',
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
  }
});
