import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText} from 'components/common-styles';
import {UNIT} from 'components/variables';


export default EStyleSheet.create({
  tip: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: UNIT * 1.2,
    paddingLeft: UNIT * 2,
    borderRadius: UNIT / 2,
    backgroundColor: '$text',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tipText: {
    flexShrink: 1,
    ...mainText,
    color: '$background',
  },
  tipCloseButton: {
    padding: UNIT,
    marginLeft: UNIT,
    paddingHorizontal: UNIT * 2,
    borderRadius: UNIT * 2,
  },
  tipIcon: {
    color: '$icon',
  },

  tipStreamActions: {
    zIndex: 1,
    position: 'absolute',
    maxHeight: 120,
    left: UNIT,
    right: UNIT,
    bottom: UNIT,
  },
});
