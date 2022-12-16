import {Platform} from 'react-native';

export const elevation1 = {
  ...Platform.select({
    ios: {
      shadowRadius: 0.75,
      shadowColor: '$separator',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.9,
    },
    android: {
      elevation: 2,
      borderBottomWidth: 0.75,
      borderColor: '$separator',
    },
  }),
};

export const elevationBottom = {
  backgroundColor: '$background',
  elevation: 5,
  shadowColor: '$text',
  shadowOpacity: 0.2,
  shadowRadius: 0.5,
  shadowOffset: {
    height: -0.5,
    width: 0,
  },
};

export const elevationTop = {
  borderTopWidth: 0.6,
  borderColor: '$separator',
};

export const boxShadow = {
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.3,
      shadowRadius: 60,
    },
    android: {
      elevation: 50,
    },
  }),
};
