import EStyleSheet from 'react-native-extended-stylesheet';
import {mainText, secondaryText} from 'components/common-styles/typography';
import {separatorBorder} from 'components/common-styles/list';
import {UNIT} from 'components/variables/variables';
import {elevation1} from 'components/common-styles/shadow';
const hPaddings = {
  paddingLeft: UNIT * 2,
  paddingRight: UNIT * 2,
};
const optionText = {...mainText, color: '$text', fontWeight: '500'};
export default EStyleSheet.create({
  settings: {
    flex: 1,
    backgroundColor: '$background',
  },
  settingsContent: {
    flexGrow: 1,
    ...hPaddings,
  },
  settingsList: {
    flex: 1,
  },
  settingsListItem: {
    flexDirection: 'row',
    marginBottom: UNIT,
  },
  settingsListItemTitle: {
    padding: UNIT,
  },
  settingsListItemTitleText: {...optionText},
  settingsListItemOption: {
    flexDirection: 'row',
    paddingVertical: UNIT * 2,
    color: '$text',
    ...separatorBorder,
    borderColor: '$separator',
  },
  settingsListItemOptionText: {
    flexGrow: 1,
    ...optionText,
  },
  settingsListItemOptionTextSecondary: {
    color: '$icon',
  },
  settingsFooter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: UNIT * 2,
  },
  settingsFooterTitle: {
    ...mainText,
    color: '$text',
    fontSize: 18,
    fontWeight: '500',
  },
  settingsFooterLink: {
    ...mainText,
    color: '$link',
    marginTop: UNIT,
    marginBottom: UNIT,
  },
  settingsFooterBuild: {...secondaryText, color: '$icon'},
  settingsAppearanceHeaderIcon: {
    marginLeft: UNIT * 1.5,
  },
  settingsAppearance: {
    padding: UNIT * 2,
  },
  elevation1: elevation1,
}) as any;