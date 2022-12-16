import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables/variables';
import {MAIN_FONT_SIZE} from 'components/common-styles/typography';
import {rowFormStyles} from 'components/common-styles/form';
import {loginStylesForm} from 'components/common-styles/login-form';

export default EStyleSheet.create({
  ...loginStylesForm,

  container: {
    ...loginStylesForm.container,
  },
  title: {
    ...loginStylesForm.title,
    color: '$text',
  },
  hintText: {
    ...loginStylesForm.hintText,
    color: '$icon',
  },
  inputUser: {
    ...rowFormStyles.input,
    marginTop: UNIT * 3,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  inputPass: {
    ...rowFormStyles.input,
    marginTop: UNIT * 2,
    marginBottom: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  error: {
    marginTop: UNIT * 2,
  },
  errorText: {
    marginBottom: UNIT,
    color: 'red',
  },
  support: {
    marginBottom: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  action: {
    ...rowFormStyles.link,
    fontSize: MAIN_FONT_SIZE,
  },
  loadingContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMessage: {
    marginTop: UNIT * 2,
  },
  loadingMessageIndicator: {
    color: '$link',
  },
  formContentCenter: {
    alignItems: 'center',
  },
});
