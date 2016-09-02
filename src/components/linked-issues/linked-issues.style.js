import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  linkedIssuesContainer: {
    marginTop: UNIT,
    marginBottom: UNIT
  },
  linkedIssuesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  relationTitle: {
    color: COLOR_FONT_GRAY
  },
  linkedIssueContainer: {
    marginLeft: UNIT
  },
  linkedIssueText: {
    color: COLOR_FONT
  }
});
