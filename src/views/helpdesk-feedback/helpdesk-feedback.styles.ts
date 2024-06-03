import EStyleSheet from 'react-native-extended-stylesheet';

import {formRowStyles} from 'components/form/form.style';
import {headerMinHeight} from 'components/header/header.styles';
import {rowFormStyles} from 'components/common-styles/form';
import {UNIT} from 'components/variables';
import {mainText, SECONDARY_FONT_SIZE} from 'components/common-styles';

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
    flex: 2,
    alignItems: 'flex-start',
    marginLeft: UNIT * 1.5,
    paddingRight: UNIT,
  },
  selectText: {
    color: '$icon',
    fontSize: SECONDARY_FONT_SIZE - 2,
  },
  selectUserDescription: {
    flex: 1,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  selectUserDescriptionText: {
    textAlign: 'right',
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
