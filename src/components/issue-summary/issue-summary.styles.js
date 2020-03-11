import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT, COLOR_MEDIUM_GRAY} from '../../components/variables/variables';
import {mainText} from '../common-styles/issue';

export default StyleSheet.create({
  summaryInput: {
    height: UNIT * 5.5,
    fontSize: 20,
    color: COLOR_FONT
  },
  descriptionInput: {
    ...mainText,
    marginTop: UNIT / 2,
    marginBottom: UNIT * 2,
    color: COLOR_FONT
  },
  separator: {
    height: 0.5,
    marginTop: UNIT,
    marginBottom: UNIT,
    marginRight: -UNIT * 2,
    backgroundColor: COLOR_MEDIUM_GRAY
  },
});
