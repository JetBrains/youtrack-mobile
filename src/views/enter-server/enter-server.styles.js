import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../../components/variables/variables';
import {rowFormStyles} from '../../components/common-styles/form';
import {loginStylesForm} from '../../components/common-styles/login-form';
import {mainText} from '../../components/common-styles/typography';


export default EStyleSheet.create({
  ...loginStylesForm,

  container: {
    ...loginStylesForm.container,
    maxWidth: '100%',
    backgroundColor: '$background',
  },
  input: {
    ...rowFormStyles.input,
    marginTop: UNIT * 3,
    marginBottom: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  button: {
    ...rowFormStyles.button,
    maxWidth: 500,
  },
  title: {
    ...loginStylesForm.title,
    color: '$text',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: UNIT * 2,
  },
  errorText: {
    flexGrow: 1,
  },
  infoIcon: {
    flexGrow: 0,
    marginTop: UNIT / 2,
    marginLeft: UNIT * 2,
  },
  text: {
    ...mainText,
    color: '$text',
  },
  placeholder: {
    color: '$icon',
  },
});
