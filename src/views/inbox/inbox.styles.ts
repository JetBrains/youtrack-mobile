import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {elevation1, HEADER_FONT_SIZE, MAIN_FONT_SIZE} from 'components/common-styles';
import {
  headerTitle,
  mainText,
  secondaryText,
} from 'components/common-styles';
import {issueIdResolved} from 'components/common-styles/issue';
import {splitViewStyles} from 'components/common-styles/split-view';
import {UNIT} from 'components/variables';
const font = {
  lineHeight: MAIN_FONT_SIZE + 2,
  fontSize: MAIN_FONT_SIZE - 2,
};
const textSecondary = {...font, color: '$textSecondary'};
export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  ...splitViewStyles,
  arrowImage: {
    lineHeight: HEADER_FONT_SIZE + 2,
  },
  notification: {
    paddingLeft: UNIT * 2,
  },
  notificationIssue: {
    marginTop: UNIT * 2,
    marginBottom: -UNIT / 2,
  },
  notificationSeparator: {
    marginLeft: UNIT * 2,
    borderBottomColor: '$separator',
    borderBottomWidth: 1,
  },
  notificationContent: {
    marginLeft: UNIT * 5.5,
    paddingBottom: UNIT * 2,
    paddingRight: UNIT * 2,
  },
  notificationIssueInfo: {
    ...mainText,
    color: '$text',
    ...Platform.select({
      ios: {
        fontWeight: '500',
      },
      android: {
        fontWeight: '$androidSummaryFontWeight',
      },
    }),
  },
  reason: {...secondaryText, paddingRight: UNIT, color: '$icon'},
  notificationChange: {
    marginTop: UNIT * 1.5,
    marginBottom: UNIT,
    padding: UNIT * 1.5,
    paddingRight: UNIT * 2,
    borderRadius: UNIT,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  notificationReactions: {
    marginTop: UNIT,
  },
  notificationContentWorkflow: {
    marginTop: UNIT,
    marginLeft: 0,
  },
  userInfo: {
    marginTop: UNIT * 2.5,
  },
  textPrimary: {...font, color: '$textSecondary'},
  textSecondary,
  listFooterMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFooterMessageIcon: {
    marginLeft: -UNIT * 2,
  },
  listFooterMessageText: {
    color: '$text',
    textAlign: 'center',
    fontSize: MAIN_FONT_SIZE + 2,
    fontWeight: '500',
  },
  change: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  changeItem: {
    marginTop: UNIT,
  },
  textRemoved: {
    color: '$icon',
    textDecorationLine: 'line-through',
  },
  changeRemoved: {
    textDecorationLine: 'line-through',
  },
  headerTitle: {
    paddingTop: UNIT * 2,
    paddingLeft: UNIT * 2,
    paddingBottom: UNIT * 2,
    backgroundColor: '$background',
  },
  headerTitleText: {...headerTitle, color: '$text'},
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {...font, color: '$link'},
  linkColor: {
    color: '$link',
  },
  resolved: {...issueIdResolved, color: '$textSecondary'},
  secondaryText: {
    color: '$icon',
  },
  reactionIcon: {
    marginTop: -UNIT / 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionIconRemoved: {
    position: 'absolute',
    width: 1,
    height: UNIT * 4,
    backgroundColor: '$error',
    transform: [
      {
        rotate: '45deg',
      },
    ],
  },
  titleShadow: elevation1,
});
