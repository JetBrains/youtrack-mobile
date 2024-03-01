import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE, secondaryText, UNIT} from 'components/common-styles';


export const rowStyles = {
  user: {
    flexDirection: 'row',
    marginLeft: -UNIT / 2,
  },
  userName: {
    flexGrow: 1,
    flexShrink: 0,
    color: '$text',
    fontSize: MAIN_FONT_SIZE + 1,
    lineHeight: MAIN_FONT_SIZE + 1,
    fontWeight: '500',
    letterSpacing: -0.22,
  },
  userAvatar: {
    width: UNIT * 5,
    height: UNIT * 5,
    marginRight: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$iconBackground',
    borderWidth: UNIT / 2,
    borderColor: '$background',
    borderRadius: UNIT,
  },
  userInfo: {
    marginTop: UNIT,
  },
  timestampContainer: {
    flexGrow: 1,
    marginRight: UNIT * 2,
    alignItems: 'flex-end',
  },
  additionalInfo: {
    ...secondaryText,
    color: '$textSecondary',
  },
};


export default EStyleSheet.create(rowStyles);
