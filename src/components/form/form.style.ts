import EStyleSheet from 'react-native-extended-stylesheet';

import feedbackFormStyles from 'components/common-styles/feedback-form';
import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  ...feedbackFormStyles,
  formInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  formInputClearSpace: {
    paddingRight: UNIT * 5,
  },
  formInputClearIcon: {
    marginTop: UNIT * 3.7,
    marginLeft: -UNIT * 3,
  },
});
