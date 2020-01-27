import {StyleSheet} from 'react-native';
import {UNIT, COLOR_LINK, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  linkedIssuesContainer: {
    marginTop: UNIT,
    marginBottom: UNIT
  },
  linkedIssuesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: UNIT / 2,
  },
  relationTitle: {
    color: COLOR_FONT_GRAY
  },
  linkedIssueContainer: {
    marginTop: UNIT / -4,
    marginLeft: UNIT,
    padding: UNIT / 4
  },
  linkedIssueText: {
    color: COLOR_LINK
  }
});
