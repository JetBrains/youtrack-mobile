import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../../../components/variables/variables';
import {MAIN_FONT_SIZE, mainText, secondaryText} from '../../../components/common-styles/typography';
import {separator} from '../../../components/common-styles/list';

const secondaryTextColor = {
  color: '$icon'
};

export default EStyleSheet.create({
  link: {
    ...mainText,
    color: '$link'
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
    paddingTop: UNIT,
    paddingLeft: UNIT,
    paddingRight: UNIT
  },
  activitySeparator: {
    ...separator,
    borderColor: '$separator',
    margin: UNIT * 2,
    marginLeft: UNIT * 7,
    marginRight: -UNIT
  },
  activityAvatar: {
    width: UNIT * 4,
    height: UNIT * 4,
    alignItems: 'center',
  },
  mergedActivity: {
    marginBottom: 0,
    paddingTop: UNIT * 3
  },
  activityAuthor: {
    color: '$textSecondary',
    flexDirection: 'row',
    marginTop: UNIT / 2,
    marginBottom: UNIT / 4
  },
  activityItem: {
    flex: 1,
    marginLeft: UNIT * 2,
  },
  activityAuthorName: {
    flexGrow: 1,
    flexShrink: 0,
    marginRight: UNIT / 2,
    ...secondaryTextColor,
    fontSize: 18,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: -0.22,
    color: '$text'
  },
  activityTimestamp: {
    ...secondaryText,
    color: '$icon',
    lineHeight: 16
  },
  activityLabel: {
    color: '$icon'
  },
  activityText: {
    color: '$icon'
  },
  activityRelatedChanges: {
    flex: 1,
    padding: UNIT * 2,
    paddingTop: UNIT,
    marginTop: UNIT * 1.5,
    marginBottom: UNIT,
    backgroundColor: '$boxBackground',
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
  activityNoActivity: {
    marginTop: UNIT * 5,
    textAlign: 'center',
    ...secondaryTextColor
  },
  activityAdded: {
    color: '$icon'
  },
  activityRemoved: {
    textDecorationLine: 'line-through',
    color: '$icon'
  },
  activityCommentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: UNIT * 1.5
  },
  activityCommentActionsMain: {
    flexGrow: 1
  },
  activityCommentActionsAddReaction: {
    color: '$iconAccent',
    marginRight: UNIT * 2
  },
  activityCommentActionsOther: {
    color: '$iconAccent'
  },

  settings: {
    margin: UNIT * 1.5
  },
  settingsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: UNIT,
    paddingTop: UNIT,
    paddingBottom: UNIT
  },
  secondaryText: {
    ...secondaryText,
    ...secondaryTextColor
  },
  settingsSwitchDisabled: {
    opacity: 0.4
  },

  links: {
    marginTop: UNIT * 1.5
  },
  linkedIssue: {
    lineHeight: UNIT * 2.5,
    marginTop: UNIT / 4
  },
  linkText: {
    color: '$link'
  },

  workTime: {
    color: '$icon',
    fontWeight: 'bold'
  },
  workComment: {
    marginBottom: UNIT,
  },

  visibility: {
    marginTop: UNIT,
    marginBottom: UNIT
  },
  loadingIndicator: {
    marginTop: UNIT * 1.5
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: UNIT,
    marginTop: UNIT,
    marginBottom: UNIT,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingsName: {
    color: '$text',
    fontSize: MAIN_FONT_SIZE,
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  secondaryTextColor: secondaryTextColor,
  iconAccent: {
    color: '$iconAccent'
  },

  commentReactions: {
    marginTop: -UNIT / 1.5
  },
  reactionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginLeft: -UNIT
  },
  reactionItem: {
    flex: 1,
    flexBasis: '11.5%',
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: UNIT
  },
  reactionButton: {
    paddingHorizontal: UNIT / 2
  }
});
