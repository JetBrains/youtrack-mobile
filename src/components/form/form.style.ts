import EStyleSheet from 'react-native-extended-stylesheet';

import feedbackFormStyles from 'components/common-styles/feedback-form';
import {mainText, SECONDARY_FONT_SIZE, UNIT} from 'components/common-styles';
import {rowFormStyles} from 'components/common-styles/form';

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
  formBlock: {
    marginTop: UNIT * 2,
  },
  formInput: {
    ...rowFormStyles.input,
    ...mainText,
    color: '$text',
  },
  formInputWithLabel: {
    paddingVertical: UNIT * 2.5,
    paddingBottom: UNIT,
    marginTop: UNIT / 4,
  },
  formInputLabel: {
    position: 'absolute',
    top: UNIT,
    left: UNIT,
    fontSize: SECONDARY_FONT_SIZE - 2,
    color: '$textSecondary',
  },
  formSelect: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formSelectButton: {
    position: 'relative',
  },
  formSelectIcon: {
    top: 1,
    right: UNIT * 2,
    color: '$icon',
  },
});
