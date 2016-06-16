import {StyleSheet} from 'react-native';

import {UNIT, COLOR_PINK, COLOR_LIGHT_GRAY, COLOR_FONT, COLOR_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  inputWrapper: {
    backgroundColor: COLOR_LIGHT_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: COLOR_GRAY
  },
  searchInput: {
    flex: 1,
    height: UNIT * 3.5,
    borderRadius: 6,
    backgroundColor: '#FFF',
    margin: UNIT,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: UNIT,
    color: COLOR_PINK,
    fontSize: 15
  },
  searchInputActive: {
    color: COLOR_FONT
  },
  cancelSearch: {
    paddingRight: UNIT * 2,
    padding: UNIT
  },
  cancelText: {
    fontSize: 16,
    color: COLOR_PINK
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
