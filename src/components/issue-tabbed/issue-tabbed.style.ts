import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {elevation1, MAIN_FONT_SIZE} from 'components/common-styles';
import {mainText, secondaryText} from 'components/common-styles/typography';
export default EStyleSheet.create({
  tabsBar: {...elevation1, backgroundColor: '$background'},
  tabsBarFluid: {
    width: 'auto',
    minWidth: 60,
  },
  tabLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabelText: {
    ...mainText,
    paddingTop: UNIT,
    paddingBottom: UNIT,
    paddingRight: UNIT,
    fontWeight: '500',
    textTransform: 'none',
    color: '$text',
    ...Platform.select({
      ios: {},
      android: {
        fontSize: MAIN_FONT_SIZE + 2,
        fontWeight: '400',
      },
    }),
  },
  createUpdateInfoPanel: {
    marginTop: UNIT * 1.5,
    marginBottom: UNIT * 1.5,
  },
  createUpdateInfoPanelButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createUpdateInfoText: {
    ...secondaryText,
    color: '$textSecondary',
    alignItems: 'baseline',
  },
  visibility: {
    flexShrink: 1,
    flex: 1,
  },
  icon: {
    color: '$icon',
  },
  tabBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: UNIT / 1.75,
    paddingVertical: UNIT / 4,
    borderRadius: UNIT / 2,
    backgroundColor: '$greyBackground',
  },
  tabBadgeText: {
    paddingLeft: UNIT / 2,
    color: '$icon',
    ...Platform.select({
      android: {
        lineHeight: MAIN_FONT_SIZE + 1,
      },
    }),
  },
  tabBadgeIcon: {
    color: '$iconAccent',
  },
});
