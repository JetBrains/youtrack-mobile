import {StyleSheet} from 'react-native';
import {
  COLOR_FONT,
  UNIT,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_MEDIUM_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_LIGHT_GRAY,
  COLOR_DARK, COLOR_PLACEHOLDER, COLOR_BLACK
} from '../../components/variables/variables';
import {mainText, secondaryText} from '../../components/common-styles/typography';
import {link} from '../../components/common-styles/button';

const font = {
  lineHeight: 18,
  fontSize: 14,
};

const textPrimary = {
  ...font,
  color: COLOR_FONT
};

const textSecondary = {
  ...font,
  color: COLOR_ICON_MEDIUM_GREY
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  arrowImage: {
    lineHeight: 22
  },
  notification: {
    paddingLeft: UNIT * 2,
  },
  notificationContent: {
    marginLeft: UNIT * 6,
    paddingBottom: UNIT * 2,
    paddingRight: UNIT * 2,
    borderBottomColor: COLOR_MEDIUM_GRAY,
    borderBottomWidth: 0.5,
  },
  notificationIssue: {
    marginTop: -UNIT,
  },
  notificationIssueInfo: {
    ...mainText,
    fontWeight: '500',
    color: COLOR_DARK
  },
  reason: {
    ...secondaryText,
    paddingRight: UNIT
  },
  notificationChange: {
    marginTop: UNIT * 2,
    marginRight: -UNIT,
    marginBottom: UNIT * 2.5,
    padding: UNIT * 1.5,
    paddingRight: UNIT * 2,
    borderRadius: UNIT,
    backgroundColor: COLOR_LIGHT_GRAY
  },
  notificationContentWorkflow: {
    marginTop: UNIT,
    marginLeft: 0
  },
  userInfo: {
    marginTop: UNIT,
    paddingTop: UNIT * 1.5
  },
  textPrimary,
  textSecondary,
  listMessageSmile: {
    paddingTop: UNIT * 6,
    fontSize: 40,
    fontWeight: '500',
    color: COLOR_PLACEHOLDER,
    textAlign: 'center',
    letterSpacing: -2
  },
  listFooterMessage: {
    ...mainText,
    color: COLOR_BLACK,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: UNIT * 4
  },
  change: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  changeItem: {
    marginTop: UNIT
  },
  changeRemoved: {
    textDecorationLine: 'line-through'
  },
  headerTitle: {
    paddingTop: UNIT * 2,
    paddingLeft: UNIT * 2,
    paddingBottom: UNIT * 2,
    backgroundColor: COLOR_FONT_ON_BLACK,
    color: 'red'
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    ...font,
    ...link,
    flexWrap: 'wrap'
  }

});
