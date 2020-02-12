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
  }
});
