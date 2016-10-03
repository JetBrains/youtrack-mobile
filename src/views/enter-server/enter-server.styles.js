import {StyleSheet} from 'react-native';
import {UNIT, COLOR_LIGHT_GRAY, COLOR_PINK} from '../../components/variables/variables';

const FONT_SIZE = 18;

export default StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    paddingTop: UNIT * 8,
    paddingLeft: UNIT * 4,
    paddingRight: UNIT * 4,
    paddingBottom: UNIT * 2,
    backgroundColor: '#FFF'
  },
  logoContainer: {
    alignItems: 'center'
  },
  logoImage: {
    flex: 1,
    height: UNIT * 10,
    resizeMode: 'contain'
  },
  title: {
    paddingTop: UNIT * 2,
    fontSize: 26,
    textAlign: 'center'
  },
  input: {
    height: UNIT * 5,
    marginTop: UNIT*4,
    marginBottom: UNIT*2,
    backgroundColor: '#FFF',
    color: '#7E7E84',
    fontSize: FONT_SIZE
  },
  apply: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: COLOR_PINK,
    alignItems: 'center'
  },
  applyDisabled: {
    backgroundColor: COLOR_LIGHT_GRAY
  },
  applyText: {
    fontSize: FONT_SIZE,
    color: '#FFF',
    alignSelf: 'stretch',
    textAlign: 'center'
  },
  connectingIndicator: {
    position: 'absolute',
    right: UNIT*2,
    top: 12
  },
  errorContainer: {
    marginTop: UNIT,
    marginBottom: UNIT
  },
  error: {
    color: 'red'
  }
});
