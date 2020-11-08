import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';
import {mainText} from '../common-styles/typography';
import {elevation1} from '../common-styles/shadow';


export default EStyleSheet.create({
  placeHolder: {
    height: UNIT * 6,
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  suggestContainer: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-start',
    position: 'relative',
    zIndex:1
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: UNIT,
    borderRadius: UNIT,
    backgroundColor: '$boxBackground'
  },
  inputWrapperActive: {
    ...elevation1,
    borderRadius: 0,
    borderBottomColor: 'transparent',
    backgroundColor: '$background'
  },
  searchInput: {
    flex: 1,
    paddingLeft: UNIT / 1.5,
    paddingVertical: UNIT * 1.6,
    marginLeft: UNIT,
    marginRight: UNIT,

    ...mainText,
    color: '$text'
  },
  searchInputHasText: {
    color: '$text'
  },
  searchInputPlaceholder: {
    justifyContent: 'center',
    color: '$icon',
  },
  searchIcon: {
    marginTop: UNIT / 2,
    marginLeft: UNIT / 2,
    color: '$icon'
  },
  clearIcon: {
    marginLeft: UNIT,
    marginRight: UNIT * 2,
    color: '$icon'
  },
  link: {
    color: '$link'
  },
  searchPanel: {
    flexGrow: 1,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 1.5
  }
});
