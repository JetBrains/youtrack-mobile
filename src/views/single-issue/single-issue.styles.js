import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_EXTRA_LIGHT_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_FONT_GRAY,
  COLOR_FONT,
  COLOR_PINK,
  COLOR_MEDIUM_GRAY,
  COLOR_LINK,
  COLOR_ICON_GREY,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_PINK_DARK
} from '../../components/variables/variables';


export default StyleSheet.create({
  container: {
    flex: 1
  },
  issueContent: {
    backgroundColor: COLOR_EXTRA_LIGHT_GRAY
  },
  headerText: {
    color: COLOR_FONT_ON_BLACK,
    fontSize: 17
  },
  savingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20
  },
  issueViewContainer: {
    padding: UNIT * 2,
    paddingTop: UNIT,
    backgroundColor: '#FFF'
  },
  issueTopPanel: {
    flexDirection: 'row',
    paddingTop: UNIT / 4
  },
  issueTopPanelText: {
    fontSize: 14,
    color: COLOR_FONT_GRAY,
  },
  issueTopPanelMoreIcon: {
    height: 9,
    resizeMode: 'contain',
    tintColor: `${COLOR_FONT}${70}`
  },
  topPanelUpdatedInformation: {
    marginTop: UNIT
  },
  summary: {
    paddingTop: UNIT,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 'bold',
    color: COLOR_FONT
  },
  tagsTitle: {
    fontWeight: 'bold'
  },
  description: {},
  attachments: {
    marginTop: UNIT * 2,
  },
  loading: {
    marginTop: UNIT * 2
  },
  loadingActivityError: {
    marginTop: UNIT * 2,
    color: COLOR_PINK_DARK,
    textAlign: 'center'
  },
  disabledSaveButton: {
    color: COLOR_FONT_GRAY
  },
  keyboardSpacer: {
    backgroundColor: COLOR_BLACK
  },

  row: {
    flexDirection: 'row',
    flex: 1
  },
  alignedRight: {
    marginRight: UNIT
  },

  issueCommentInputContainer: {
    justifyContent: 'flex-end'
  },

  activitiesContainer: {
    paddingBottom: UNIT * 3,
    backgroundColor: COLOR_EXTRA_LIGHT_GRAY
  },
  activity: {
    flexDirection: 'row',
    paddingTop: UNIT * 4,
    paddingLeft: UNIT,
    paddingRight: UNIT,
  },
  mergedActivity: {
    marginBottom: 0,
    marginLeft: UNIT * 5,
    paddingTop: UNIT * 2
  },
  activityAuthor: {
    flexDirection: 'row'
  },
  activityItem: {
    flex: 1,
    marginLeft: UNIT,
  },
  activityAuthorName: {
    flex: 0,
    marginRight: UNIT / 2,
    color: COLOR_FONT,
    fontWeight: 'bold'
  },
  activityTimestamp: {
    color: COLOR_FONT,
  },
  activityLabel: {
    color: COLOR_ICON_MEDIUM_GREY
  },
  activityText: {
    color: COLOR_FONT
  },
  activityRelatedChanges: {
    flex: 1,
    paddingTop: UNIT,
    paddingRight: UNIT,
    paddingBottom: UNIT * 2,
    marginTop: UNIT * 2,
    marginRight: -1 * UNIT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: COLOR_MEDIUM_GRAY,
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
    marginTop: -1,
    marginLeft: 10,
    marginRight: 10,
    resizeMode: 'contain',
    tintColor: COLOR_ICON_GREY
  },

  linkedIssue: {
    flexDirection: 'row',
  },
  linkText: {
    color: COLOR_LINK
  },

  settingsModal: {
    justifyContent: 'flex-end'
  },
  settingsPanel: {
    backgroundColor: COLOR_BLACK
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
    paddingTop: UNIT,
    paddingBottom: UNIT,
    marginBottom: UNIT * 4
  },
  settingsToggleText: {
    color: COLOR_PINK,
    textAlign: 'center'
  },

  workTime: {
    fontWeight: 'bold'
  },
  workComment: {
    marginBottom: UNIT,
  }
});
