import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  linkedIssuesContainer: {
    marginTop: UNIT,
    marginBottom: UNIT,
  },
  linkedIssuesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: UNIT / 2,
  },
  relationTitle: {
    color: '$icon',
  },
  linkedIssueContainer: {
    marginTop: UNIT / -4,
    marginLeft: UNIT,
    padding: UNIT / 4,
  },
  linkedIssueText: {
    color: '$link',
  },
});
