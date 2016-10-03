import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_FONT_GRAY, COLOR_LIGHT_GRAY} from '../../components/variables/variables';

const FONT_SIZE = 18;

export default StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: UNIT * 4,
    paddingLeft: UNIT * 4,
    paddingRight: UNIT * 4,
    paddingBottom: UNIT * 2,
    backgroundColor: '#FFF'
  },
  welcome: {
    fontSize: 26,
    textAlign: 'center'
  },
  linkContainer: {
    padding: 10,
    alignItems: 'center'
  },
  signin: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: COLOR_PINK,
    alignItems: 'center'
  },
  signinDisabled: {
    backgroundColor: COLOR_LIGHT_GRAY
  },
  signinText: {
    fontSize: FONT_SIZE,
    color: '#FFF',
    alignSelf: 'stretch',
    textAlign: 'center'
  },
  loggingInIndicator: {
    position: 'absolute',
    right: UNIT*2,
    top: 12
  },
  urlChangeButton: {
    marginLeft: -UNIT*2
  },
  urlChangeWrapper: {
    flexDirection: 'row'
  },
  urlChangeIcon: {
    width: UNIT*2,
    height: UNIT*2,
    marginTop: UNIT/5,
    resizeMode: 'contain'
  },
  urlChangeText: {
    paddingLeft: UNIT/2,
    color: COLOR_PINK,
    fontSize: 16
  },
  linkLike: {
    fontSize: FONT_SIZE,
    color: COLOR_PINK
  },
  input: {
    height: UNIT * 5,
    marginTop: UNIT,
    marginBottom: UNIT,
    backgroundColor: '#FFF',
    color: '#7E7E84',
    fontSize: FONT_SIZE
  },
  inputsContainer: {
    height: 120
  },
  actionsContainer: {},
  logoContainer: {
    alignItems: 'center'
  },
  logoImage: {
    flex: 1,
    height: UNIT * 10,
    resizeMode: 'contain'
  },
  descriptionText: {
    fontSize: 12,
    color: COLOR_FONT_GRAY,
    textAlign: 'center'
  },
  error: {
    color: 'red'
  }
});
