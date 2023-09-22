import EStyleSheet from 'react-native-extended-stylesheet';

import {clearIcon, inputWrapper, searchInput, searchInputWithMinHeight} from 'components/common-styles/search';
import {elevation1, UNIT} from 'components/common-styles';


export default EStyleSheet.create({
  modal: {
    height: '50%',
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
    ...searchInputWithMinHeight,
    flex: 0,
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
    padding: UNIT / 2,
  },
  link: {
    color: '$link',
  },
});
