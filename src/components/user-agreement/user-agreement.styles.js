import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_FONT_GRAY, COLOR_FONT, COLOR_FONT_ON_BLACK} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    marginTop: UNIT * 2,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  markdownScroll: {
    paddingTop: 0,
    padding: UNIT * 2
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    padding: UNIT * 2,
    alignItems: 'center'
  },
  buttonText: {
    color: COLOR_PINK
  },
  buttonTextDisabled: {
    color: COLOR_FONT_GRAY
  }
});


export const markdownStyles = {
  heading: {
    color: COLOR_FONT
  },
  paragraph: {
    color: COLOR_FONT
  }
};
