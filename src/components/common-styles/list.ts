import {Platform} from 'react-native';
import {UNIT} from 'components/variables';
export const separatorBorder = {
  ...Platform.select({
    ios: {
      borderBottomWidth: 0.5,
    },
    android: {
      borderBottomWidth: 0.8,
    },
  }),
};
export const separatorTopBorder = {
  ...Platform.select({
    ios: {
      borderTopWidth: 0.5,
    },
    android: {
      borderTopWidth: 0.8,
    },
  }),
};
const separatorCommon = {
  height: 1,
  marginLeft: UNIT * 2,
};
export const separator = {...separatorCommon, ...separatorBorder};
export const separatorTop = {...separatorCommon, ...separatorTopBorder};
