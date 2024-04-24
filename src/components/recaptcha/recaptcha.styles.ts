import EStyleSheet from 'react-native-extended-stylesheet';
import {mainText, UNIT} from 'components/common-styles';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.87)',
  },
  recaptcha: {
    flexGrow: 1,
  },
  link: {
    color: '$link',
  },
 text: {
    ...mainText,
   marginLeft: UNIT / 2,
    color: '$link',
  },
  button: {
    marginTop: UNIT * 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
