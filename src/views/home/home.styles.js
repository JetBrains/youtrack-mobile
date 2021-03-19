import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../../components/variables/variables';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$background',
  },
  logoContainer: {
    flex: 2,
    justifyContent: 'flex-end',
  },
  logoImage: {
    height: UNIT * 20,
    resizeMode: 'contain',
  },
  retry: {
    textAlign: 'center',
    padding: UNIT,
    fontSize: 17,
    color: '$link',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  message: {
    padding: UNIT * 2,
    color: '$text',
  },
  urlButton: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    height: 46,
  },
  urlIcon: {
    width: UNIT * 2,
    height: UNIT * 2,
    marginLeft: UNIT,
    tintColor: '$textSecondary',
  },
  url: {
    textAlign: 'center',
    marginTop: UNIT * 2,
    color: '$icon',
  },
  urlInput: {
    height: UNIT * 5,
    width: 240,
    backgroundColor: '$background',
    borderBottomColor: '$link',
    borderBottomWidth: 1,
  },
  editUrlIcon: {
    marginLeft: UNIT,
  },
});
