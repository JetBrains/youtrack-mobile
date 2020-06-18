import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT,
  COLOR_PINK,
  COLOR_ICON_LIGHT_BLUE,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_LIGHT_GRAY,
} from '../../../components/variables/variables';
import {mainText, secondaryText} from '../../../components/common-styles/typography';
import {link} from '../../../components/common-styles/button';
import {separator} from '../../../components/common-styles/list';

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
    paddingTop: UNIT,
    paddingLeft: UNIT,
    paddingRight: UNIT
  },
  activitySeparator: {
    ...separator,
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
    flexDirection: 'row',
    marginBottom: UNIT
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

  visibility: {
    marginTop: UNIT,
    marginBottom: UNIT
  },
  loadingIndicator: {
    marginTop: UNIT * 1.5
  }
});
