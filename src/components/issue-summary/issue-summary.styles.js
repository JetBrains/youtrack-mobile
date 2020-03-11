import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT, COLOR_MEDIUM_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  summaryInput: {
    height: UNIT * 5.5,
    fontSize: 20,
    color: COLOR_FONT
  },
  descriptionInput: {
    marginTop: UNIT / 2,
    marginBottom: UNIT * 2,
    color: COLOR_FONT,
    backgroundColor: 'yellow'
  },
  separator: {
    height: 0.5,
    marginTop: UNIT,
    marginBottom: UNIT,
    marginRight: -UNIT * 2,
    backgroundColor: COLOR_MEDIUM_GRAY
  },
});
