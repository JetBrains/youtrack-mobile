/* @flow */

import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../../components/variables/variables';

import {mainText, secondaryText} from '../../components/common-styles/typography';
import {formStyles} from '../../components/common-styles/form';
import {separatorBorder} from '../../components/common-styles/list';


const hPaddings = {
  paddingLeft: UNIT * 2,
  paddingRight: UNIT * 2
};
export default EStyleSheet.create({
  ...formStyles,

  settings: {
    flex: 1,
    backgroundColor: '$background'
  },
  settingsContent: {
    flexGrow: 1,
    ...hPaddings
  },
  settingsItems: {
    flex: 1
  },
  settingsTitle: {
    marginTop: UNIT,
    marginBottom: UNIT / 2
  },
  settingsItem: {
    flexDirection: 'row',
    padding: UNIT * 2,
    paddingLeft: 0,
    color: '$text',
    ...separatorBorder,
    borderColor: '$separator'
  },
  settingsItemText: {
    ...mainText,
    flexGrow: 1,
    color: '$text',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  textSecondary: {
    color: '$icon',
  },
  settingsCheckbox: {
    padding: UNIT
  },
  settingsFooter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: UNIT * 2,
    marginBottom: UNIT * 3
  },
  settingsFooterTitle: {
    ...mainText,
    color: '$text',
    fontSize: 18,
    fontWeight: '500'
  },
  settingsFooterLink: {
    ...mainText,
    color: '$text',
    marginTop: UNIT,
    marginBottom: UNIT,
  },
  settingsFooterBuild: {
    ...secondaryText,
    color: '$icon',
  },

  settingsAppearanceHeaderIcon: {
    marginLeft: UNIT * 1.5
  },
  settingsAppearance: {
    marginTop: UNIT * 2,
    padding: UNIT * 2.5,
    paddingRight: 0
  }
});
