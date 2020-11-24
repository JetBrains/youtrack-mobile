import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../../components/variables/variables';
import {headerTitle, mainText, secondaryText} from '../../components/common-styles/typography';
import {issueIdResolved} from '../../components/common-styles/issue';
import {elevation1} from '../../components/common-styles/shadow';

const font = {
  lineHeight: 18,
  fontSize: 14,
};

const textSecondary = {
  ...font,
  color: '$icon'
};

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
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
    borderBottomColor: '$separator',
    borderBottomWidth: 0.5,
  },
  notificationIssue: {
    marginTop: -UNIT,
  },
  notificationIssueInfo: {
    ...mainText,
    color: '$text',
    ...Platform.select({
      ios: {
        fontWeight: '500'
      },
      android: {
        fontWeight: '$androidSummaryFontWeight',
      }
    })
  },
  reason: {
    ...secondaryText,
    paddingRight: UNIT,
    color: '$icon',
  },
  notificationChange: {
    marginTop: UNIT * 2,
    marginRight: -UNIT,
    marginBottom: UNIT * 2.5,
    padding: UNIT * 1.5,
    paddingRight: UNIT * 2,
    borderRadius: UNIT,
    color: '$text',
    backgroundColor: '$boxBackground'
  },
  notificationContentWorkflow: {
    marginTop: UNIT,
    marginLeft: 0
  },
  userInfo: {
    marginTop: UNIT,
    paddingTop: UNIT * 1.5
  },
  textPrimary: {
    ...font,
    color: '$icon'
  },
  textSecondary,
  listMessageSmile: {
    paddingTop: UNIT * 6,
    fontSize: 40,
    fontWeight: '500',
    color: '$icon',
    textAlign: 'center',
    letterSpacing: -2
  },
  listFooterMessage: {
    ...mainText,
    color: '$text',
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
    color: '$icon',
    textDecorationLine: 'line-through'
  },
  headerTitle: {
    paddingTop: UNIT * 2,
    paddingLeft: UNIT * 2,
    paddingBottom: UNIT * 2,
    backgroundColor: '$background',
  },
  headerTitleText: {
    ...headerTitle,
    color: '$text'
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: {
    ...font,
    color: '$link'
  },
  resolved: {
    ...issueIdResolved,
    color: '$icon'
  },
  secondaryText: {
    color: '$icon'
  },
  reactionIcon: {
    width: UNIT * 4,
    height: UNIT * 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$boxBackground',
    borderRadius: UNIT / 2
  },
  reactionIconRemoved: {
    position: 'absolute',
    width: 2,
    height: UNIT * 4,
    backgroundColor: '$error',
    transform: [{rotate: '45deg'}]
  },
  titleShadow: elevation1
});
