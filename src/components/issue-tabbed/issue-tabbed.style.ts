import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {elevation1} from 'components/common-styles';
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
        fontSize: 18,
        fontWeight: '400',
      },
    }),
  },
  createUpdateInfoPanel: {
    marginVertical: UNIT,
  },
  createUpdateInfoText: {
    paddingTop: UNIT * 0.75,
    ...secondaryText,
    color: '$textSecondary',
  },
  visibility: {
    flexShrink: 1,
    flex: 1,
  },
});
