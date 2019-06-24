import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT_GRAY, COLOR_PINK, COLOR_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  logoContainer: {
    flex: 2,
    justifyContent: 'flex-end'
  },
  logoImage: {
    height: UNIT * 20,
    resizeMode: 'contain'
  },
  retry: {
    textAlign: 'center',
    padding: UNIT,
    fontSize: 17,
    color: COLOR_PINK
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  message: {
    padding: UNIT * 2
  },
  urlButton: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    height: 46
  },
  urlIcon: {
    width: UNIT * 2,
    height: UNIT * 2,
    marginLeft: UNIT,
    tintColor: COLOR_GRAY
  },
  url: {
    textAlign: 'center',
    marginTop: UNIT * 2,
    color: COLOR_FONT_GRAY
  },
  urlInput: {
    height: UNIT * 5,
    width: 240,
    backgroundColor: '#FFF',
    borderBottomColor: COLOR_PINK,
    borderBottomWidth: 1
  }
});
