import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_SELECTED_DARK, COLOR_TRANSPARENT_BLACK, COLOR_FONT_ON_BLACK, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: COLOR_TRANSPARENT_BLACK,
    alignItems: 'center'
  },
  cancelButton: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLOR_PINK
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
    color: COLOR_FONT_ON_BLACK
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: UNIT,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2
  },
  loadingRow: {
    justifyContent: 'center'
  },
  headerText: {
    color: COLOR_FONT_ON_BLACK
  },
  selectItemValue: {
    flexDirection: 'row'
  },
  itemIcon: {
    marginRight: UNIT * 2
  },
  itemTitle: {
    fontSize: 24,
    color: COLOR_FONT_ON_BLACK
  },
  loadingMessage: {
    paddingLeft: UNIT*2,
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
  }
});
