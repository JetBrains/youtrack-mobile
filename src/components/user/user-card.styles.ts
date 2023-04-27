import EStyleSheet from 'react-native-extended-stylesheet';

import {HEADER_FONT_SIZE, secondaryText, UNIT} from 'components/common-styles';

import {rowStyles as userInfoStyles} from './user-info.styles';


export default EStyleSheet.create({
  container: {
    flex: 1,
    padding: UNIT,
    paddingBottom: UNIT * 3,
  },
  generalInfo: {
    height: UNIT * 15,
    marginBottom: UNIT * 2,
    alignItems: 'center',
  },
  blockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatar: {
    borderRadius: UNIT * 8,
    width: UNIT * 8,
    height: UNIT * 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$disabled',
    overflow: 'hidden',
  },
  avatarImage: {
    borderRadius: UNIT * 8,
  },
  groupIcon: {
    position: 'absolute',
    zIndex: 10,
    bottom: -UNIT / 4,
    right: 0,
    width: UNIT * 2,
    height: UNIT * 2,
    backgroundColor: '$background',
  },
  button: {
    padding: UNIT * 1.5,
    marginTop: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: UNIT,
    borderColor: '$separator',
    backgroundColor: '$background',
  },
  buttonText: {
    color: '$link',
  },
  userName: {
    ...userInfoStyles.userName,
    marginTop: UNIT * 1.5,
  },
  text: {
    color: '$text',
  },
  label: {
    ...secondaryText,
    lineHeight: HEADER_FONT_SIZE + 8,
    color: '$textSecondary',
  },
  iconCopy: {
    color: '$iconAccent',
  },
});
