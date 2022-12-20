import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables/variables';
import {rowFormStyles} from 'components/common-styles/form';
import {loginStylesForm} from 'components/common-styles/login-form';
import {mainText} from 'components/common-styles/typography';
const buttonMaxWidth = 500;
export default EStyleSheet.create({
  ...loginStylesForm,
  container: {...loginStylesForm.container},
  scrollContainer: {
    ...loginStylesForm.scrollContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    ...rowFormStyles.input,
    marginTop: UNIT * 3,
    marginBottom: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  button: {...rowFormStyles.button, maxWidth: buttonMaxWidth},
  title: {...loginStylesForm.title, color: '$text', textAlign: 'center'},
  errorContainer: {
    flexDirection: 'row',
    flex: 1,
    alignSelf: 'flex-start',
    maxWidth: buttonMaxWidth,
    marginTop: UNIT * 2,
    marginRight: UNIT * 2,
  },
  error: {
    maxWidth: '95%',
  },
  infoIcon: {
    marginTop: UNIT / 2,
    marginLeft: UNIT * 2,
  },
  text: {...mainText, color: '$text'},
  placeholder: {
    color: '$icon',
  },
});
