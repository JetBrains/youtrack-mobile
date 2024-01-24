import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE, mainText, SECONDARY_FONT_SIZE, secondaryText, UNIT} from 'components/common-styles';
import {separator} from '../common-styles/list';

const secondaryTextColor = {
  color: '$textSecondary',
};
export const rowStyles = {
  activityWrapper: {
    paddingTop: UNIT * 3,
    paddingBottom: UNIT * 2.5,
    paddingHorizontal: UNIT,
  },
  activityWrapperSecured: {
    paddingTop: UNIT * 2,
    backgroundColor: '$greyBackground',
  },
  activityWrapperNoTop: {
    paddingTop: 0,
  },
  activityWrapperNoBottom: {
    paddingBottom: 0,
  },
  activity: {
    flexDirection: 'row',
  },
  activitySeparator: {
    ...separator,
    borderColor: '$separator',
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
    flexWrap: 'wrap',
    marginTop: UNIT / 2,
    marginBottom: UNIT / 4,
  },
  activityStream: {
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 3,
    paddingHorizontal: UNIT,
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
    fontSize: MAIN_FONT_SIZE + 2,
    lineHeight: MAIN_FONT_SIZE + 1,
    fontWeight: '500',
    letterSpacing: -0.22,
    color: '$text',
  },
  activityTimestamp: {
    ...secondaryText,
    color: '$textSecondary',
    lineHeight: MAIN_FONT_SIZE,
  },
  activityTimestampMerged: {
    color: '$text', fontWeight: '500',
  },
  activityLabel: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
  },
  activityText: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
  },
  activityRelatedChanges: {
    flex: 1,
    padding: UNIT * 1.5,
    paddingTop: UNIT,
    marginVertical: UNIT,
    backgroundColor: '$boxBackground',
    borderRadius: UNIT,
    lineHeight: SECONDARY_FONT_SIZE,
  },
  activityHistoryChanges: {
    flex: 1,
    lineHeight: SECONDARY_FONT_SIZE,
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
    color: '$textSecondary',
  },
  activityRemoved: {
    textDecorationLine: 'line-through',
    color: '$textSecondary',
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
    alignItems: 'center',
    paddingLeft: UNIT * 6,
    marginRight: UNIT,
  },
  activityCommentAttachments: {
    marginVertical: UNIT,
  },
  activityIcon: {
    color: '$iconAccent',
  },
  link: {...secondaryText, color: '$link'},
  secondaryTextColor: secondaryTextColor,
  activityVisibility: {
    marginTop: UNIT,
    marginLeft: UNIT * 6,
    marginBottom: UNIT * 2,
  },
  activityVisibilityMerged: {
    marginLeft: 0,
    marginTop: UNIT * 2,
  },
  activityWorkIcon: {
    position: 'relative',
    top: -2,
  },
  activityStarTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityWorkTime: {
    marginLeft: UNIT / 2,
    color: '$textSecondary',
    fontWeight: 'bold',
  },
  activityWorkComment: {
    marginTop: UNIT,
  },
  activityWorkEditIcon: {
    position: 'absolute',
    right: 0,
  },
  activityHighlighted: {
    backgroundColor: '$blueBackground',
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
    fontSize: SECONDARY_FONT_SIZE - 2,
    color: '$textSecondary',
  },
  vcsBottomSheetHeader: {
    paddingTop: UNIT * 2,
    paddingBottom: UNIT,
    paddingHorizontal: UNIT * 4,
  },
  contextMenu: {
    flexDirection: 'row',
    padding: UNIT / 2,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  contextMenuItem: {
    padding: UNIT,
    minWidth: 160,
    paddingRight: 0,
    color: '$text',
  },
  contextMenuItemDestructive: {
    color: '$error',
  },
  contextMenuItemIcon: {
    width: UNIT * 2,
    height: UNIT * 2,
  },
  contextMenuTitle: {
    paddingHorizontal: UNIT * 2.5,
    maxHeight: 200,
    borderBottomWidth: 1,
    borderColor: '$separator',
  },
  contextMenuTitleItem: {
    paddingTop: UNIT,
    paddingBottom: UNIT * 1.5,
    ...secondaryText,
  },
};
export default EStyleSheet.create(rowStyles);
