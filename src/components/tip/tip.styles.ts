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
    position: 'relative',
    top: -UNIT / 4,
    marginRight: UNIT * 1.5,
    color: '$background',
  },
  tipBox: {
    zIndex: 1,
    position: 'absolute',
    left: UNIT,
    right: UNIT,
  },
  tipStreamActions: {
    maxHeight: 120,
    bottom: UNIT,
  },
  tipNotificationSettings: {
    top: 50,
  },
  tipColout: {
    zIndex: 1,
    position: 'absolute',
    width: UNIT * 2,
    height: UNIT * 2,
    borderRadius: UNIT / 4,
    right: UNIT,
    top: -UNIT / 2,
    backgroundColor: '$text',
    transform: [{rotate: '45deg'}],
  },
});
