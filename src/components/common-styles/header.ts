import {Platform} from 'react-native';
import {UNIT} from '../variables/variables';
import {headerTitle} from './typography';
export const menuHeight = UNIT * 8;
export const headerTitleText = {
  ...headerTitle,
  color: '$text',
  ...Platform.select({
    ios: {
      fontWeight: '500',
    },
    android: {
      fontWeight: '600',
    },
  }),
};
