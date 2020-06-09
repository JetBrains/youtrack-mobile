import {Platform} from 'react-native';

import {COLOR_EXTRA_MEDIUM_GRAY, COLOR_PLACEHOLDER} from '../variables/variables';

export const elevation1 = {
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
      elevation: 2
    },
  })
};
export const elevationTop = {
  borderTopWidth: 0.3,
  borderColor: COLOR_EXTRA_MEDIUM_GRAY
};
