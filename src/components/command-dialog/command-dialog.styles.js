import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {mainText} from '../common-styles/typography';
import {elevation1} from '../common-styles/shadow';

export default EStyleSheet.create({
  inputWrapper: {
    ...elevation1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: UNIT * 1.5,
    backgroundColor: '$background',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  searchInput: {
    ...mainText,
    flex: 1,
    height: UNIT * 5,
    margin: UNIT,
    color: '$text'
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
    color: '$icon'
  },
  suggestionText: {
    ...mainText,
    flex: 1,
    fontWeight: '500',
    color: '$text'
  },
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
    color: '$text'
  },
  commandDescriptionError: {
    color: '$error'
  },
  applyButton: {
    paddingRight: UNIT
  }
});
