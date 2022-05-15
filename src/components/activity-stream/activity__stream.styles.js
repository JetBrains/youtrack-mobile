import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText, secondaryText} from '../common-styles/typography';
import {separator} from '../common-styles/list';
import {UNIT} from '../variables/variables';

const secondaryTextColor = {
  color: '$icon',
};

export const rowStyles = {
  activity: {
    flexDirection: 'row',
    paddingTop: UNIT,
    paddingLeft: UNIT,
    paddingRight: UNIT,
  },
  activityMerged: {
    marginBottom: 0,
    paddingTop: UNIT * 3,
  },
  activitySeparator: {
    ...separator,
    borderColor: '$separator',
    margin: UNIT * 2,
    marginLeft: UNIT * 7,
    marginRight: -UNIT,
  },
  activityAvatar: {
    width: UNIT * 4,
    height: UNIT * 4,
    alignItems: 'center',
  },
  activityAuthor: {
    color: '$textSecondary',
    flexDirection: 'row',
    marginTop: UNIT / 2,
    marginBottom: UNIT / 4,
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
    color: '$text',
  },
  activityTimestamp: {
    ...secondaryText,
    color: '$icon',
    lineHeight: 16,
  },
  activityLabel: {
    color: '$icon',
  },
  activityText: {
    color: '$icon',
  },
  activityRelatedChanges: {
    flex: 1,
    padding: UNIT * 2,
    paddingTop: UNIT,
    marginTop: UNIT * 1.5,
    marginBottom: UNIT,
    backgroundColor: '$boxBackground',
    borderRadius: UNIT,
    lineHeight: 14,
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
    ...secondaryTextColor,
  },
  activityAdded: {
    color: '$icon',
  },
  activityRemoved: {
    textDecorationLine: 'line-through',
    color: '$icon',
  },
  activityTextValueChange: {
    flexGrow: 2,
  },
  activityCommentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: UNIT * 2,
  },
  activityCommentActionsMain: {
    flexGrow: 1,
  },
  activityCommentActionsAddReaction: {
    color: '$iconAccent',
    marginRight: UNIT * 2,
  },
  activityCommentActionsOther: {
    color: '$iconAccent',
  },

  activityCommentReactions: {
    marginTop: -UNIT / 1.5,
  },
  activityCommentAttachments: {
    marginVertical: UNIT,
  },
  activityIcon: {
    color: '$iconAccent',
  },
  link: {
    ...secondaryText,
    color: '$link',
  },
  secondaryTextColor: secondaryTextColor,
  activityVisibility: {
    marginTop: UNIT,
    marginBottom: UNIT,
  },

  activityWork: {
    flexDirection: 'row',
  },
  activityWorkIcon: {
    position: 'relative',
    top: -2,
  },
  activityWorkTime: {
    marginLeft: UNIT / 2,
    color: '$icon',
    fontWeight: 'bold',
  },
  activityWorkComment: {
    marginTop: UNIT,
  },
  activityWorkEditIcon: {
    position: 'absolute',
    right: 0,
  },

  vcsInfo: {
    flexDirection: 'row',
  },
  vcsInfoDate: {
    flexShrink: 1,
    flexGrow: 1,
    marginRight: UNIT * 2,
  },
  showMoreMessage: {
    marginTop: UNIT,
  },
  vcsMessage: {
    paddingTop: UNIT,
    color: '$text',
  },
  vcsError: {
    color: '$error',
  },
  vcsSourceButton: {
    marginVertical: UNIT,
    marginLeft: UNIT * 3,
    ...mainText,
    color: '$link',
  },
  vcsSourceButtonIcon: {
    paddingRight: UNIT / 2,
    marginRight: UNIT * 2,
  },
  vcsSourceSubTitle: {
    fontSize: 12,
    color: '$icon',
  },
};

export default EStyleSheet.create(rowStyles);
