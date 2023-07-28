import EStyleSheet from 'react-native-extended-stylesheet';

import {clearIcon, inputWrapper, searchInput, searchInputWithMinHeight} from 'components/common-styles/search';
import {elevation1, mainText, UNIT} from 'components/common-styles';


export default EStyleSheet.create({
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
    zIndex: 1,
  },
  inputContainer: {
    ...inputWrapper,
    ...mainText,
    flex: 1,
  },
  inputWrapper,
  inputWrapperActive: {
    ...elevation1,
    borderRadius: 0,
    borderBottomColor: 'transparent',
    backgroundColor: '$background',
  },
  searchInput,
  searchInputWithMinHeight,
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
});
