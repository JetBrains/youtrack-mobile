import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {summaryTitle} from '../../components/common-styles/issue';
import {UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/typography';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  articleDetails: {
    padding: UNIT * 2,
    paddingTop: UNIT * 3
  },
  articleActivities: {
    padding: UNIT * 2,
    paddingLeft: UNIT
  },
  description: {
    ...mainText,
    marginTop: UNIT
  },
  summaryEdit: {
    ...Platform.select({
      ios: {
        marginTop: 3
      },
      android: {
        marginTop: 1
      }
    })
  },
  summaryText: {
    ...summaryTitle,
    color: '$text'
  }
});
