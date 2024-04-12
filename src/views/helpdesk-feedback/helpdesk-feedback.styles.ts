import EStyleSheet from 'react-native-extended-stylesheet';

import {rowFormStyles} from 'components/common-styles/form';
import feedbackForm from 'components/common-styles/feedback-form';
import {headerMinHeight} from 'components/header/header.styles';
import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  ...rowFormStyles,
  ...feedbackForm,
  formContainer: {
    justifyContent: 'flex-end',
    paddingHorizontal: UNIT * 2,
    backgroundColor: '$background',
  },
  verticalOffset: {
    marginBottom: headerMinHeight,
  },
  separator: {
    height: UNIT * 3.5,
  },
  selectUserOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectUserOptionInfo: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: UNIT * 1.5,
  },
});
