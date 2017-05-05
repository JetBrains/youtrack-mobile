import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT, COLOR_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  summaryInput: {
    color: COLOR_FONT,
    fontSize: 20,
    height: UNIT * 5.5
  },
  descriptionInput: {
    marginTop: UNIT / 2,
    marginBottom: UNIT,
    color: COLOR_FONT,
    fontSize: 16
  },
  separator: {
    height: 0.5,
    marginTop: UNIT,
    marginBottom: UNIT,
    marginLeft: - UNIT*2,
    marginRight: - UNIT*2,
    backgroundColor: COLOR_GRAY
  },
});
