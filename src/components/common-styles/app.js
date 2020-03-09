import {COLOR_FONT_ON_BLACK, COLOR_PLACEHOLDER} from '../../components/variables/variables';
import {Platform} from 'react-native';

export const APP_BACKGROUND = COLOR_FONT_ON_BLACK;

export const shadowBottom = {
  backgroundColor: COLOR_FONT_ON_BLACK,
  ...Platform.select({
    ios: {
      shadowRadius: 0.75,
      shadowColor: COLOR_PLACEHOLDER,
      shadowOffset: {
        width: 0,
        height: 1
      },
      shadowOpacity: 0.25,
    },
    android: {
      elevation: 1
    },
  }),
};
