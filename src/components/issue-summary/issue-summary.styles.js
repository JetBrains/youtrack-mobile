import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';
import {mainText} from '../common-styles/typography';

export const summary = {
  fontSize: 20,
  lineHeight: 24,
  letterSpacing: -0.19,
  ...Platform.select({
    ios: {
      fontWeight: '500'
    },
    android: {
      fontWeight: '$androidSummaryFontWeight',
    }
  })
};

export default EStyleSheet.create({
  summary: {
    ...summary,
    color: '$text'
  },
  descriptionInput: {
    ...mainText,
    marginTop: UNIT / 2,
    color: '$text'
  },
  separator: {
    height: 1,
    marginTop: UNIT * 2,
    marginBottom: UNIT,
    marginRight: -UNIT * 2,
    backgroundColor: '$separator'
  },
});
