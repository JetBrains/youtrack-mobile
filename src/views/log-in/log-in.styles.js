import {StyleSheet} from 'react-native';
import {UNIT} from '../../components/variables/variables';
import {formStyles, FONT_SIZE} from '../../components/common-styles/form';
import {loginStylesForm} from '../../components/common-styles/login-form';

export default StyleSheet.create({
  ...loginStylesForm,

  inputUser: {
    marginTop: UNIT * 3,
    ...formStyles.input
  },
  inputPass: {
    marginTop: UNIT * 2,
    marginBottom: UNIT * 2,
    ...formStyles.input
  },
  error: {
    marginTop: UNIT,
  },
  errorText: {
    marginBottom: UNIT,
    color: 'red'
  },
  support: {
    marginBottom: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  action: {
    ...formStyles.link,
    fontSize: FONT_SIZE
  }
});
