import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE, mainText, SECONDARY_FONT_SIZE, secondaryText, UNIT} from 'components/common-styles';
import {separator} from '../common-styles/list';

const secondaryTextColor = {
  color: '$textSecondary',
};
export const rowStyles = {
  activityStream: {
    paddingVertical: UNIT * 2,
  },
  activityMergedConnector: {
    position: 'absolute',
    zIndex: -1,
    left: 23,
    top: 20,
    bottom: -20,
    width: 2,
    opacity: 0.2,
    backgroundColor: '$blueDark',
  },
  activityMergedConnectorFirst: {
    top: 52,
  },
  activityMergedLeaf: {
    left: 17,
    top: 18,
    width: 14,
    height: 14,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '$background',
    backgroundColor: '$blueDark',
  },
  activityWrapper: {
    position: 'relative',
    paddingHorizontal: UNIT,
    marginTop: UNIT,
  },
  activityWrapperMerged: {
    marginTop: -UNIT,
  },
  activity: {
    flexDirection: 'row',
  },
  activityContent: {
    flex: 1,
    padding: UNIT,
    marginLeft: UNIT,
    paddingTop: UNIT * 1.5,
    backgroundColor: '$background',
    borderRadius: UNIT,
  },
  activityContentSecured: {
    backgroundColor: '$yellowLightBackground',
  },
  activityTitle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityVisibility: {
    justifyContent: 'flex-end',
    marginLeft: UNIT * 3,
  },
  activitySeparator: {
    ...separator,
    marginTop: UNIT * 2,
    borderColor: '$separator',
  },
  activityAvatar: {
    width: UNIT * 4,
    height: UNIT * 4,
    borderRadius: 6,
    marginTop: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$blueLight',
  },
  activityAvatarMerged: {
    backgroundColor: 'transparent',
  },
  activityAuthor: {
    color: '$textSecondary',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activityAuthorName: {
    marginRight: UNIT,
    color: '$text',
    fontSize: MAIN_FONT_SIZE + 1,
    lineHeight: MAIN_FONT_SIZE + 1,
    fontWeight: '500',
    letterSpacing: -0.22,
  },
  activityTimestamp: {
    ...secondaryText,
    color: '$textSecondary',
    lineHeight: MAIN_FONT_SIZE,
  },
  activityTimestampMerged: {
    fontWeight: '500',
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
    backgroundColor: '$blueLighter',
    borderRadius: UNIT,
    lineHeight: SECONDARY_FONT_SIZE,
  },
  activityRelatedChangesSecured: {
    backgroundColor: '$yellowBackground',
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
    color: '$blueDark',
  },
  link: {...secondaryText, color: '$link'},
  secondaryTextColor: secondaryTextColor,
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
