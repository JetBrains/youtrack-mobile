import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT_GRAY} from '../../components/variables/variables';

export const COLOR = COLOR_FONT_GRAY;

export default StyleSheet.create({
  commentVisibility: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: UNIT,
    marginBottom: UNIT
  },
  commentVisibilityText: {
    color: COLOR,
    marginLeft: UNIT / 1.5,
  }
});
