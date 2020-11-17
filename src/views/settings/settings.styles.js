/* @flow */

import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../../components/variables/variables';

import {MAIN_FONT_SIZE, mainText, SECONDARY_FONT_SIZE, secondaryText} from '../../components/common-styles/typography';
import {separatorBorder} from '../../components/common-styles/list';
import {rowFormStyles} from '../../components/common-styles/form';


const hPaddings = {
  paddingLeft: UNIT * 2,
  paddingRight: UNIT * 2
};
const optionText = {
  ...mainText,
  color: '$text',
  fontWeight: '500',
  textTransform: 'capitalize'
};

export default EStyleSheet.create({
  settings: {
    flex: 1,
    backgroundColor: '$background'
  },
  settingsContent: {
    flexGrow: 1,
    ...hPaddings
  },
  settingsList: {
    flex: 1
  },
  settingsListItem: {
    flexDirection: 'row',
    marginVertical: UNIT
  },
  settingsListItemTitle: {
    padding: UNIT
  },
  settingsListItemTitleText: {
    ...optionText
  },
  settingsListItemOption: {
    flexDirection: 'row',
    padding: UNIT * 2,
    paddingLeft: 0,
    color: '$text',
    ...separatorBorder,
    borderColor: '$separator'
  },
  settingsListItemOptionText: {
    flexGrow: 1,
    ...optionText
  },
  settingsListItemOptionTextSecondary: {
    color: '$icon',
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
    color: '$link',
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
  },

  feedbackContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    paddingHorizontal: UNIT
  },
  feedbackForm: {
    flexGrow: 1,
    paddingHorizontal: UNIT
  },
  feedbackFormType: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  feedbackFormDescription: {
    flexGrow: 1,
    paddingBottom: UNIT * 3
  },
  feedbackFormText: {
    fontSize: MAIN_FONT_SIZE,
    color: '$text'
  },
  feedbackFormTextSup: {
    position: 'absolute',
    top: UNIT / 4,
    left: UNIT,
    fontSize: SECONDARY_FONT_SIZE - 2,
    color: '$textSecondary'
  },
  feedbackFormInput: {
    ...rowFormStyles.input,
    paddingVertical: UNIT * 2,
    marginTop: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground'
  },
  feedbackFormInputDescription: {
    ...rowFormStyles.input,
    flexGrow: 1,
    marginTop: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground'
  },
});
