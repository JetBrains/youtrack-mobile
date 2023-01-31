import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {elevation1} from 'components/common-styles/shadow';
import {
  headerTitle,
  mainText,
  secondaryText,
} from 'components/common-styles/typography';
import {issueIdResolved} from 'components/common-styles/issue';
import {splitViewStyles} from 'components/common-styles/split-view';
import {UNIT} from 'components/variables';
const font = {
  lineHeight: 18,
  fontSize: 14,
};
const textSecondary = {...font, color: '$icon'};
export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  ...splitViewStyles,
  arrowImage: {
    lineHeight: 22,
  },
  notification: {
    paddingLeft: UNIT * 2,
  },
  notificationContent: {
    marginTop: -UNIT,
    marginLeft: UNIT * 6,
    paddingBottom: UNIT * 2,
    paddingRight: UNIT * 2,
    borderBottomColor: '$separator',
    borderBottomWidth: 0.5,
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
    marginTop: UNIT * 2,
    marginRight: -UNIT,
    marginBottom: UNIT,
    padding: UNIT * 1.5,
    paddingRight: UNIT * 2,
    borderRadius: UNIT,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  notificationContentWorkflow: {
    marginTop: UNIT,
    marginLeft: 0,
  },
  userInfo: {
    marginTop: UNIT,
    paddingTop: UNIT * 1.5,
  },
  userInfoReaction: {
    marginBottom: UNIT * 2,
  },
  textPrimary: {...font, color: '$icon'},
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
    fontSize: 18,
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
  resolved: {...issueIdResolved, color: '$icon'},
  secondaryText: {
    color: '$icon',
  },
  reactionIcon: {
    width: UNIT * 4,
    height: UNIT * 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$boxBackground',
    borderRadius: UNIT / 2,
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
