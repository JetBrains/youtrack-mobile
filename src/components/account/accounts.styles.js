import {StyleSheet} from 'react-native';
import {UNIT, COLOR_FONT} from '../variables/variables';
import {mainText, secondaryText} from '../common-styles/issue';


export default StyleSheet.create({
  accountContainer: {
    flexDirection: 'row',
    marginTop: UNIT * 3,
    height: 192
  },
  accountProfile: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: UNIT * 3,
    marginRight: UNIT * 3
  },
  accountProfileAvatar: {
    borderRadius: UNIT
  },
  accountProfileName: {
    ...mainText,
    marginTop: UNIT * 2,
    marginBottom: UNIT,
    fontSize: 18,
    fontWeight: '500',
    color: COLOR_FONT,
  },
  accountProfileServerURL: {
    ...secondaryText,
    color: COLOR_FONT,
  },
  accountAction: {
    height: UNIT * 6
  }
});
