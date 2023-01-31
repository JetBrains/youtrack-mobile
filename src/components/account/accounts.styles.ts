import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {mainText, secondaryText} from 'components/common-styles/typography';
export const SWIPER_HEIGHT = 178;
export default EStyleSheet.create({
  accountContainer: {
    flexDirection: 'row',
    minHeight: SWIPER_HEIGHT,
    marginBottom: UNIT / 2,
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
    marginTop: UNIT * 2,
    marginBottom: UNIT,
    fontWeight: '500',
    color: '$text',
  },
  accountProfileServerURL: {
    lineHeight: 14,
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
  accountPager: {
    marginBottom: -UNIT,
  },
});
