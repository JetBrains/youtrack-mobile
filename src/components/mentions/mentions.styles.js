import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  link: {
    color: '$link'
  },
  suggestionsContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },
  suggestionsLoadingMessage: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UNIT * 2,
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    borderBottomWidth: 1,
    borderColor: '$boxBackground'
  },
  suggestionName: {
    flexGrow: 1,
    marginLeft: UNIT,
    color: '$text'
  },
  suggestionDescription: {
    color: '$icon'
  }
});
