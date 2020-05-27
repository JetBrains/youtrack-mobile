import {StyleSheet} from 'react-native';

import {
  UNIT,
} from '../../components/variables/variables';
import {secondaryText} from '../../components/common-styles/issue';

export default StyleSheet.create({
  issuesCount: {
    marginTop: UNIT * 2,
    marginBottom: UNIT * 2,
    marginLeft: UNIT * 2,
    ...secondaryText
  }
});
