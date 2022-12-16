import EStyleSheet from 'react-native-extended-stylesheet';

import {clearIcon, inputWrapper, searchInput} from '../common-styles/search';
import {elevation1} from '../common-styles/shadow';
import {UNIT} from '../variables/variables';


export default EStyleSheet.create({
  placeHolder: {
    height: UNIT * 6,
  },
  modal: {
    height: '100%',
    justifyContent: 'flex-start',
  },
  suggestContainer: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-start',
    position: 'relative',
    zIndex:1,
  },
  inputWrapper: inputWrapper,
  inputWrapperActive: {
    ...elevation1,
    borderRadius: 0,
    borderBottomColor: 'transparent',
    backgroundColor: '$background',
  },
  searchInput: searchInput,
  searchInputHasText: {
    color: '$text',
  },
  searchInputPlaceholder: {
    justifyContent: 'center',
    color: '$icon',
  },
  searchIcon: {
    marginTop: UNIT / 2,
    marginLeft: UNIT / 2,
    color: '$icon',
  },
  clearIcon: {
    ...clearIcon,
    backgroundColor: '$boxBackground',
    borderRadius: UNIT * 2,
    padding: UNIT / 2,
  },
  link: {
    color: '$link',
  },
  searchPanel: {
    flexGrow: 1,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 1.5,
  },
});
