import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {mainText} from '../common-styles/typography';
import {elevation1} from '../common-styles/shadow';
import {inputWrapper, searchInput} from '../common-styles/search';
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
  searchInput: {...searchInput},
  suggestion: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionDescription: {
    flex: 1,
    marginRight: UNIT,
    ...mainText,
    color: '$icon',
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