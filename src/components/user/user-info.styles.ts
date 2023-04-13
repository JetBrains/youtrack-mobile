import EStyleSheet from 'react-native-extended-stylesheet';

import {secondaryText, UNIT} from 'components/common-styles';


export const rowStyles = {
  user: {
    flexDirection: 'row',
  },
  userName: {
    flexGrow: 1,
    flexShrink: 0,
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.22,
    color: '$text',
  },
  userAvatar: {
    minWidth: UNIT * 5,
    minHeight: UNIT * 5,
    marginLeft: -UNIT / 2,
    marginTop: -UNIT / 4,
    marginRight: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$boxBackground',
    borderWidth: UNIT / 2,
    borderColor: '$background',
    borderRadius: UNIT,
  },
  timestampContainer: {
    flexGrow: 1,
    marginRight: UNIT * 2,
    alignItems: 'flex-end',
  },
  additionalInfo: {
    ...secondaryText,
    color: '$icon',
  },
};


export default EStyleSheet.create(rowStyles);
