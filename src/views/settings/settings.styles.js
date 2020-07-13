/* @flow */

import {StyleSheet} from 'react-native';
import {COLOR_BLACK, UNIT} from '../../components/variables/variables';

import {mainText, secondaryText} from '../../components/common-styles/typography';
import {formStyles} from '../../components/common-styles/form';


export default StyleSheet.create({
  ...formStyles,

  settings: {
    flex: 1,
  },
  settingsContent: {
    flexGrow: 1,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    flexDirection: 'column'
  },
  settingsOther: {
    flexGrow: 1,
    paddingLeft: UNIT,
    paddingRight: UNIT,
    alignItems: 'center'
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
