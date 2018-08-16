import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK, COLOR_FONT_ON_BLACK, COLOR_PINK, COLOR_PLACEHOLDER} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    backgroundColor: COLOR_BLACK,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLOR_FONT_ON_BLACK,
    fontSize: 18,
    marginBottom: UNIT
  },
  button: {
    margin: UNIT/2,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    color: COLOR_PINK
  },
  buttonTextDisabled: {
    color: COLOR_PLACEHOLDER
  }
});
