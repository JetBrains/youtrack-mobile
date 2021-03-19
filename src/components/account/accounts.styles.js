import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {mainText, secondaryText} from '../common-styles/typography';

export const SWIPER_HEIGHT = 200;

export default EStyleSheet.create({
  accountContainer: {
    flexDirection: 'row',
    marginTop: UNIT * 3,
    minHeight: SWIPER_HEIGHT,
  },
  accountProfile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  accountProfileAvatar: {
    borderRadius: UNIT,
  },
  accountProfileName: {
    ...mainText,
    fontSize: 18,
    marginTop: UNIT * 3,
    marginBottom: UNIT,
    fontWeight: '500',
    color: '$text',
  },
  accountProfileServerURL: {
    ...secondaryText,
    color: '$icon',
  },
  accountAction: {
    width: UNIT * 4,
    height: UNIT * 6,
  },
  accountActionLogOut: {
    alignItems: 'flex-end',
  },
});
