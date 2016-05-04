import {StyleSheet} from 'react-native';

import {UNIT, COLOR_PINK, COLOR_FONT} from '../../components/variables/variables';

export default StyleSheet.create({
  inputWrapper: {
    backgroundColor: COLOR_PINK,
    flexDirection: 'row',
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
  cancelSearch: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  cancelText: {
    fontSize: 16,
    color: '#FFF'
  },
  searchSuggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 48,
    top: -1000,
    backgroundColor: '#FFFE'
  }
});
