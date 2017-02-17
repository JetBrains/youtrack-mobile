import {StyleSheet} from 'react-native';
import {UNIT, COLOR_SELECTED_DARK, COLOR_TRANSPARENT_BLACK, COLOR_FONT_ON_BLACK, COLOR_PINK, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLOR_TRANSPARENT_BLACK
  },
  inputWrapper: {
    backgroundColor: COLOR_TRANSPARENT_BLACK,
    justifyContent: 'center'
  },
  searchInput: {
    height: UNIT * 4,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: UNIT,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2
  },
  headerText: {
    color: COLOR_FONT_ON_BLACK
  },
  itemIcon: {
    width: UNIT * 4,
    height: UNIT * 4,
    marginRight: UNIT * 2,
    borderRadius: UNIT * 2
  },
  itemTitle: {
    fontSize: 24,
    color: COLOR_FONT_ON_BLACK
  },
  loadingMessage: {
    paddingLeft: UNIT*2,
    color: COLOR_FONT_GRAY
  },
  selectedMark: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: UNIT / 2,
    backgroundColor: COLOR_PINK
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
