import {StyleSheet} from 'react-native';
import {UNIT, COLOR_LIGHT_GRAY, COLOR_FONT, COLOR_PINK, FOOTER_HEIGHT} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: FOOTER_HEIGHT,
    backgroundColor: '#FFFFFFF4'
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
    color: '#7E7E84',
    margin: UNIT,
    padding: 6
  },
  separator: {
    height: 0.5,
    backgroundColor: '#C8C7CC'
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
    marginLeft: UNIT * 2,
    fontSize: 18,
    color: COLOR_FONT
  },
  selectedMark: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: UNIT / 2,
    backgroundColor: COLOR_PINK
  }
});
