import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_FONT_GRAY,
  COLOR_FONT,
  COLOR_PINK,
  COLOR_ICON_LIGHT_BLUE,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_LIGHT_GRAY
} from '../../../components/variables/variables';
import {mainText, secondaryText} from '../../../components/common-styles/issue';
import {link} from '../../../components/common-styles/button';

export default StyleSheet.create({
  secondaryText: secondaryText,
  link: {
    ...mainText,
    ...link
  },

  container: {
    flex: 1
  },
  activities: {
    flexDirection: 'column',
    flex: 1
  },
  activitiesContainer: {
    paddingLeft: UNIT,
    paddingBottom: UNIT * 3,
    paddingRight: UNIT
  },

  activity: {
    flexDirection: 'row',
    paddingTop: UNIT * 4,
    paddingLeft: UNIT,
    paddingRight: UNIT,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
  },
  mergedActivity: {
    marginBottom: 0,
    paddingTop: UNIT * 3
  },
  activityAuthor: {
    flexDirection: 'row',
    marginBottom: UNIT * 1.5
  },
  activityItem: {
    flex: 1,
    marginLeft: UNIT * 2,
  },
  activityAuthorName: {
    flexGrow: 1,
    flexShrink: 0,
    marginRight: UNIT / 2,
    color: COLOR_FONT,
    fontSize: 18,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: -0.22,
  },
  activityTimestamp: {
    ...secondaryText,
    lineHeight: 16
  },
  activityLabel: {
    color: COLOR_ICON_MEDIUM_GREY
  },
  activityText: {
    color: COLOR_ICON_MEDIUM_GREY
  },
  activityRelatedChanges: {
    flex: 1,
    padding: UNIT * 2,
    paddingTop: UNIT,
    marginTop: UNIT * 2,
    backgroundColor: COLOR_LIGHT_GRAY,
    borderRadius: UNIT,
    lineHeight: 14
  },
  activityHistoryChanges: {
    flex: 1,
    lineHeight: 14,
  },
  activityChange: {
    marginTop: UNIT / 2,
  },
  activityRemoved: {
    textDecorationLine: 'line-through'
  },
  activityHistoryIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: COLOR_ICON_LIGHT_BLUE
  },
  activityCommentActions: {
    flexDirection: 'row',
    marginTop: UNIT * 2
  },
  activityAddCommentInputContainer: {
    justifyContent: 'flex-end'
  },

  settingsModal: {
    justifyContent: 'flex-end'
  },
  settingsPanel: {
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  settingsApplyButton: {
    backgroundColor: COLOR_PINK,
    padding: UNIT,
    paddingLeft: UNIT * 2
  },
  settingsApplyButtonDisabled: {
    backgroundColor: COLOR_FONT,
    opacity: 0.5
  },
  settingsApplyButtonText: {
    height: 24,
    fontSize: 20,
    color: COLOR_FONT_ON_BLACK,
    textAlign: 'center'
  },
  settingsSelect: {
    flex: 0,
    paddingBottom: UNIT * 2
  },
  settingsOrderSettings: {
    borderTopWidth: 1,
    borderColor: COLOR_FONT_GRAY,
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 3
  },
  settingsOrderSettingsText: {
    flex: 1,
    fontSize: 24,
    color: COLOR_FONT_ON_BLACK,
    textAlign: 'left'
  },
  settingsToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UNIT,
    paddingTop: UNIT,
    paddingBottom: UNIT
  },
  settingsToggleIcon: {
    marginTop: -1,
    marginLeft: UNIT,
    color: COLOR_ICON_MEDIUM_GREY
  },

  links: {
    marginTop: UNIT * 1.5
  },
  linkedIssue: {
    flexDirection: 'row',
  },
  linkText: {
    color: COLOR_PINK
  },

  workTime: {
    fontWeight: 'bold'
  },
  workComment: {
    marginBottom: UNIT,
  },

});
