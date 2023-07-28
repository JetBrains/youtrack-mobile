import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1, UNIT, mainText} from 'components/common-styles';
import {inputWrapper, searchInputWithMinHeight} from 'components/common-styles/search';


export default EStyleSheet.create({
  container: {
    height: '100%',
  },
  inputWrapper: {
    ...inputWrapper,
    ...elevation1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '$background',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  searchInput: {
    ...searchInputWithMinHeight,
    minHeight: UNIT * 5,
  },
  suggestion: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionDescription: {
    flex: 1,
    marginRight: UNIT,
    ...mainText,
    color: '$textSecondary',
  },
  suggestionText: {...mainText, flex: 1, fontWeight: '500', color: '$text'},
  commandPreview: {
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 2,
    paddingLeft: UNIT * 4,
    paddingRight: UNIT * 4,
    marginLeft: -UNIT,
    marginRight: -UNIT,
    borderBottomColor: '$disabled',
    borderBottomWidth: 0.5,
  },
  commandDescription: {
    color: '$text',
  },
  commandDescriptionError: {
    color: '$error',
  },
  applyButton: {
    paddingRight: UNIT,
  },
});
