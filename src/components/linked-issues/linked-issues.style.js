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
  resolved: {
    color: '$resolved',
    textDecorationLine: 'line-through',
  },
  linkedIssuesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: -UNIT * 2,
    marginVertical: UNIT * 2,
    paddingRight: UNIT * 2.5,
    paddingVertical: UNIT * 2,
    borderTopWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: '$separator',
  },
  linkedIssues: {
    flex: 0.95,
  },
  linkedIssuesTitle: {
    color: '$icon',
    marginBottom: UNIT / 2,
  },
});
