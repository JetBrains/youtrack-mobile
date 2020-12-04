import EStyleSheet from 'react-native-extended-stylesheet';

import {summaryTitle} from '../../components/common-styles/issue';
import {UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/typography';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  content: {
    padding: UNIT * 2,
  },
  description: {
    ...mainText,
    marginTop: UNIT * 2,
  },
  summary: {
    marginTop: UNIT,
  },
  summaryText: {
    ...summaryTitle,
    color: '$text'
  },

  articleActivities: {
    paddingHorizontal: UNIT,
    paddingVertical: UNIT * 2,
  }
});
