import EStyleSheet from 'react-native-extended-stylesheet';

import {formRowStyles} from 'components/form/form.style';
import {headerMinHeight} from 'components/header/header.styles';
import {rowFormStyles} from 'components/common-styles/form';
import {UNIT} from 'components/variables';
import {mainText} from 'components/common-styles';

export default EStyleSheet.create({
  ...rowFormStyles,
  ...formRowStyles,
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
  },
  selectUserOptionInfo: {
    flexDirection: 'row',
    flex: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: UNIT * 1.5,
  },
  selectUserDescription: {
    flex: 1,
    alignItems: 'flex-end',
  },
  captcha: {
    ...mainText,
    marginLeft: UNIT / 2,
    color: '$link',
  },
  captchaCheckbox: {
    color: '$link',
  },
  attachments: {
    marginBottom: UNIT,
  },
});
