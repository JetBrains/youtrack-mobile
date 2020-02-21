import {StyleSheet, Platform} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_FONT_GRAY,
  COLOR_FONT,
  COLOR_PINK,
  COLOR_MEDIUM_GRAY,
  COLOR_ICON_LIGHT_BLUE,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_PINK_DARK
} from '../../components/variables/variables';
import {secondaryText, mainText} from '../../components/common-styles/issue';
import {link} from '../../components/common-styles/button';


export default StyleSheet.create({
  secondaryText: secondaryText,
  container: {
    flex: 1
  },
  issueContent: {
    backgroundColor: COLOR_FONT_ON_BLACK,
  },
  headerText: {
    color: COLOR_BLACK,
    fontSize: 20,
    letterSpacing: 0.13,
    fontWeight: '500'
  },
  headerTextResolved: {
    color: COLOR_ICON_MEDIUM_GREY,
    textDecorationLine: 'line-through'
  },
  issueStar: {
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2
  },
  savingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20
  },
  issueView: {
    marginTop: UNIT * 2,
    padding: UNIT * 2
  },
  issueTopPanel: {
    paddingTop: UNIT / 4
  },
  issueTopPanelText: {
    ...secondaryText
  },
  issueTopPanelMoreIcon: {
    height: 9,
    resizeMode: 'contain',
    tintColor: `${COLOR_FONT}${70}`
  },
  topPanelUpdatedInformation: {
    marginTop: UNIT * 0.75,
    marginBottom: UNIT * 2
  },
  summary: {
    paddingTop: UNIT,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.19,
    color: COLOR_BLACK
  },
  tags: {
    marginTop: UNIT * 2
  },
  description: {
    marginTop: UNIT * 2,
  },
  attachments: {
    marginTop: UNIT * 2,
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
    paddingTop: UNIT * 2
  },
  activityAuthor: {
    flexDirection: 'row'
  },
  activityItem: {
    flex: 1,
    marginLeft: UNIT * 2,
  },
  activityAuthorName: {
    flex: 0,
    marginRight: UNIT / 2,
    color: COLOR_FONT,
    fontSize: 18,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: -0.22,
  },
  activityTimestamp: {
    ...secondaryText,
    color: COLOR_FONT,
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
    resizeMode: 'contain',
    tintColor: COLOR_ICON_LIGHT_BLUE
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

  workTime: {
    fontWeight: 'bold'
  },
  workComment: {
    marginBottom: UNIT,
  },

  tabsBar: {
    backgroundColor: COLOR_FONT_ON_BLACK,
    ...Platform.select({
      ios: {
        shadowRadius: 0.6,
        shadowColor: COLOR_BLACK,
        shadowOffset: {
          width: 0,
          height: 1
        },
        shadowOpacity: 0.25,
      },
      android: {
        elevation: 1
      },
    }),
  },
  tabLabel: {
    ...mainText,
    paddingTop: UNIT,
    paddingBottom: UNIT,
    fontWeight: '500',
    textTransform: 'none'
  },
  tabLazyPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    ...mainText,
    ...link
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: UNIT
  },
  issueAdditionalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  issueAdditionalInfo: {
    flex: 1
  }
});
