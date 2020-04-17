/* @flow */

import {StyleSheet} from 'react-native';
import {COLOR_BLACK, UNIT} from '../../components/variables/variables';

import {mainText, secondaryText} from '../../components/common-styles/issue';
import {formStyles} from '../../components/common-styles/form';


export default StyleSheet.create({
  ...formStyles,

  settings: {
    flex: 1
  },
  settingsContent: {
    flex: 1,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    paddingBottom: UNIT * 3
  },
  settingsOther: {
    flexGrow: 1
  },
  settingsFooter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsFooterTitle: {
    ...mainText,
    color: COLOR_BLACK,
    fontSize: 18,
    fontWeight: '500'
  },
  settingsFooterLink: {
    ...mainText,
    ...formStyles.link,
    marginTop: UNIT,
    marginBottom: UNIT,
  },
  settingsFooterBuild: {
    ...secondaryText
  }
});
