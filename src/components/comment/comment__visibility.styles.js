import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  visibility: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: UNIT,
    alignItems: 'center'
  },
  visibilityIcon: {
    width: 16,
    marginRight: UNIT / 2,
    resizeMode: 'contain'
  },
  visibilityText: {
    color: COLOR_FONT_GRAY,
  }
});
