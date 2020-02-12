import {StyleSheet} from 'react-native';

import {
  UNIT,
  COLOR_BLACK,
  COLOR_LIGHT_GRAY,
  COLOR_PINK,
  COLOR_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_FONT_GRAY
} from '../../components/variables/variables';

export const FONT_SIZE = 16;

export const containerPadding = UNIT * 4;

export const formStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1
  },
  container: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingLeft: containerPadding,
    paddingRight: containerPadding,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  input: {
    width: '100%',
    padding: UNIT * 1.5,
    paddingLeft: UNIT,
    paddingRight: UNIT,
    borderRadius: UNIT,
    backgroundColor: COLOR_LIGHT_GRAY,
    color: COLOR_BLACK,
    fontSize: FONT_SIZE
  },
  button: {
    width: '100%',
    padding: UNIT * 1.5,
    alignItems: 'center',
    borderRadius: UNIT,
    backgroundColor: COLOR_PINK,
  },
  buttonDisabled: {
    backgroundColor: COLOR_GRAY
  },
  buttonText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: FONT_SIZE,
    color: COLOR_FONT_ON_BLACK
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center'
  },
  hintText: {
    textAlign: 'center',
    color: COLOR_FONT_GRAY,
    fontSize: 12
  },
  errorText: {
    color: 'red'
  },
  link: {
    color: COLOR_PINK
  }
});
