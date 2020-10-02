import {Platform} from 'react-native';
import {UNIT} from '../variables/variables';


export const separatorBorder = {
  ...Platform.select({
    ios: {
      borderBottomWidth: 0.5
    },
    android: {
      borderBottomWidth: 0.8
    }
  })
};

export const separator = {
  height: 1,
  marginLeft: UNIT * 2,
  ...separatorBorder
};
