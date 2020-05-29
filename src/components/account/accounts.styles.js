import {StyleSheet} from 'react-native';
import {UNIT, COLOR_BLACK} from '../variables/variables';
import {mainText, secondaryText} from '../common-styles/issue';

export const SWIPER_HEIGHT = 200;

export default StyleSheet.create({
  accountContainer: {
    flexDirection: 'row',
    marginTop: UNIT * 3,
    minHeight: SWIPER_HEIGHT
  },
  accountProfile: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  accountProfileAvatar: {
    borderRadius: UNIT
  },
  accountProfileName: {
    ...mainText,
    fontSize: 18,
    marginTop: UNIT * 3,
    marginBottom: UNIT,
    fontWeight: '500',
    color: COLOR_BLACK,
  },
  accountProfileServerURL: {
    ...secondaryText,
    color: COLOR_BLACK,
  },
  accountAction: {
    width: UNIT * 4,
    height: UNIT * 6
  },
  accountActionLogOut: {
    alignItems: 'flex-end'
  }
});
