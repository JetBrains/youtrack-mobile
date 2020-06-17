import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT, COLOR_MEDIUM_GRAY, COLOR_BLACK} from '../variables/variables';
import {mainText} from '../common-styles/typography';

export const summary = {
  fontSize: 20,
  fontWeight: '500',
  lineHeight: 24,
  letterSpacing: -0.19,
  color: COLOR_BLACK
};

export default StyleSheet.create({
  summary: summary,
  descriptionInput: {
    ...mainText,
    marginTop: UNIT / 2,
    color: COLOR_FONT
  },
  separator: {
    height: 0.5,
    marginTop: UNIT * 2,
    marginBottom: UNIT,
    marginRight: -UNIT * 2,
    backgroundColor: COLOR_MEDIUM_GRAY
  },
});
