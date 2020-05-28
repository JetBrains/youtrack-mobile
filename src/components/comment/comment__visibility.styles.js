import {StyleSheet} from 'react-native';
import {COLOR_FONT_GRAY, UNIT} from '../variables/variables';

export default StyleSheet.create({
  commentVisibility: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentVisibilityText: {
    color: COLOR_FONT_GRAY,
    marginLeft: UNIT / 1.5,
  }
});
