import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/common-styles';

export default EStyleSheet.create({
  button: {
    width: UNIT * 6,
    height: UNIT * 6,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 5,
    borderRadius: UNIT * 4,
    backgroundColor: '$link',
    alignItems: 'center',
    justifyContent: 'center',
    color: '$background',
  },
  buttonActive: {
    backgroundColor: '$error',
  },
  buttonDisabled :{
    backgroundColor: '$linkLight',
  },
});
