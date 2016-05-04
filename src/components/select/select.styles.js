import {StyleSheet} from 'react-native';
import {UNIT, COLOR_LIGHT_GRAY, COLOR_FONT, COLOR_PINK, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFFF0'
  },
  inputWrapper: {
    backgroundColor: COLOR_LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchInput: {
    flex: 1,
    height: UNIT * 4,
    borderRadius: 6,
    backgroundColor: '#FFF',
    margin: UNIT,
    paddingTop: 2,
    paddingLeft: UNIT,
    color: COLOR_FONT
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
  itemIcon: {
    width: UNIT * 4,
    height: UNIT * 4,
    borderRadius: UNIT * 2
  },
  itemTitle: {
    fontSize: 18,
    color: COLOR_FONT
  },
  loadingMessage: {
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
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  colorField: {
    marginRight: UNIT * 2
  }
});
