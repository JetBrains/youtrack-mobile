import {StyleSheet} from 'react-native';
import {
  COLOR_FONT_GRAY,
  COLOR_FONT,
  UNIT,
  COLOR_EXTRA_LIGHT_GRAY,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_MEDIUM_GRAY,
  COLOR_FONT_ON_BLACK
} from '../../components/variables/variables';

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
    backgroundColor: COLOR_EXTRA_LIGHT_GRAY
  },
  arrowImage: {
    lineHeight: 22
  },
  notification: {
    marginBottom: UNIT * 2,
    padding: UNIT * 2,
    backgroundColor: COLOR_FONT_ON_BLACK,
    borderBottomColor: COLOR_MEDIUM_GRAY,
    borderBottomWidth: 1,
    borderTopColor: COLOR_MEDIUM_GRAY,
    borderTopWidth: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  summary: {
    lineHeight: 20,
    fontSize: 17,
    color: COLOR_FONT,
    flexShrink: 1
  },
  subHeader: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  reason: {
    lineHeight: 15,
    fontSize: 12,
    color: COLOR_FONT_GRAY
  },
  issueId: textSecondary,
  notificationContent: {
    marginTop: -2 * UNIT,
    marginLeft: UNIT * 6,
    marginBottom: UNIT * 2,
  },
  notificationContentWorkflow: {
    marginTop: UNIT,
    marginLeft: 0
  },
  userInfo: {
    marginTop: UNIT,
    paddingTop: UNIT * 1.5,
    borderTopColor: COLOR_MEDIUM_GRAY,
    borderTopWidth: 1
  },
  textPrimary,
  textSecondary,
  listMessageSmile: {
    paddingTop: UNIT * 6,
    fontSize: 36,
    color: COLOR_FONT,
    textAlign: 'center'
  },
  listFooterMessage: {
    textAlign: 'center',
    padding: UNIT * 2
  },
  strong: {
    color: COLOR_FONT,
    fontWeight: '600'
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
  }
});
