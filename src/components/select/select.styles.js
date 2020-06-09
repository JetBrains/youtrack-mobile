import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_GRAY,
  COLOR_FONT,
  COLOR_MEDIUM_GRAY,
  COLOR_BLACK, COLOR_FONT_ON_BLACK
} from '../variables/variables';
import {mainText} from '../common-styles/issue';
import {elevation1} from '../common-styles/shadow';

export default StyleSheet.create({
  inputWrapper: {
    ...elevation1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: UNIT * 1.5,
    backgroundColor: COLOR_FONT_ON_BLACK,
  },
  cancelButton: {
    paddingRight: UNIT * 1.5,
    padding: UNIT
  },
  searchInput: {
    ...mainText,
    flex: 1,
    height: UNIT * 5,
    margin: UNIT,
    color: COLOR_FONT
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: UNIT * 2,
    paddingRight: UNIT * 1.5,
    borderColor: COLOR_MEDIUM_GRAY,
    borderBottomWidth: 0.3,
    height: UNIT * 7
  },
  loadingRow: {
    justifyContent: 'center'
  },
  headerText: {
    color: COLOR_FONT
  },
  selectItemValue: {
    flexDirection: 'row'
  },
  itemIcon: {
    marginRight: UNIT * 2
  },
  itemTitle: {
    ...mainText,
    fontWeight: '500',
    color: COLOR_BLACK
  },
  loadingMessage: {
    paddingLeft: UNIT * 2,
    color: COLOR_FONT_GRAY
  },
  selectedMarkIcon: {
    width: UNIT * 3,
    height: UNIT * 3,
    resizeMode: 'contain'
  },
  colorFieldItemWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  colorField: {
    marginRight: UNIT * 2
  },
  applyButton: {
    paddingRight: UNIT
  }
});
