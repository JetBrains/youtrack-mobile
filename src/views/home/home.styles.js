import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT_GRAY, COLOR_PINK} from '../../components/variables/variables';

const URL_BUTTON_HEIGHT = 36;

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  logoImage: {
    height: UNIT * 20,
    resizeMode: 'contain'
  },
  message: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: UNIT * 2,
    textAlign: 'center'
  },
  urlButton: {
    height: URL_BUTTON_HEIGHT,
    marginBottom: -URL_BUTTON_HEIGHT
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
