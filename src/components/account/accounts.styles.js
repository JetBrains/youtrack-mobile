import {StyleSheet} from 'react-native';
import {UNIT, COLOR_GRAY, COLOR_FONT_ON_BLACK} from '../variables/variables';

const iconHeight = UNIT * 3;

export default StyleSheet.create({
  accountContainer: {
    flexDirection: 'row',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: UNIT * 2
  },
  profileContainerMultipleAccount: {
    paddingBottom: UNIT * 4
  },
  profileName: {
    color: COLOR_GRAY,
    marginTop: UNIT/2,
    marginBottom: UNIT * 2
  },
  serverURL: {
    marginTop: UNIT,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLOR_FONT_ON_BLACK,
  },
  actionIcon: {
    height: iconHeight,
    resizeMode: 'contain'
  },
  action: {
    flex: 0,
    justifyContent: 'flex-start',
    height: iconHeight + UNIT
  }
});
