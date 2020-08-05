import {StyleSheet} from 'react-native';
import {UNIT} from '../../components/variables/variables';
import {formStyles} from '../../components/common-styles/form';
import {loginStylesForm} from '../../components/common-styles/login-form';


export default StyleSheet.create({
  ...loginStylesForm,

  input: {
    marginTop: UNIT * 3,
    marginBottom: UNIT * 2,
    ...formStyles.input
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  errorText: {
    flexGrow: 1
  },
  infoIcon: {
    flexGrow: 0,
    marginTop: UNIT / 2,
    marginLeft: UNIT * 2
  }
});
