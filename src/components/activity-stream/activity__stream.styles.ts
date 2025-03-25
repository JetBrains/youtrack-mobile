import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE, mainText, SECONDARY_FONT_SIZE, secondaryText, UNIT} from 'components/common-styles';
import {separator, separatorTopBorder} from '../common-styles/list';

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
    opacity: 0.25,
    backgroundColor: '$iconAction',
  },
  activityMergedConnectorFirst: {
    top: 50,
  },
  activityMergedLeaf: {
    left: 17,
    top: 7,
    width: 14,
    height: 14,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '$background',
    backgroundColor: '$iconAction',
  },
  activityWrapper: {
    position: 'relative',
    paddingHorizontal: UNIT,
    marginVertical: UNIT * 1.5,
  },
  activityWrapperMerged: {
    marginTop: -UNIT * 2,
  },
  activity: {
    flexDirection: 'row',
  },
  activityContent: {
    flex: 1,
    padding: UNIT,
    marginLeft: UNIT / 2,
    borderRadius: UNIT,
  },
  activityContentSecured: {
    backgroundColor: '$privateBackground',
  },
  activityTitle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activitySeparator: {
    ...separator,
    marginLeft: UNIT,
    borderColor: 'transparent',
  },
  pinnedActivitiesBlockIcon: {
    color: '$icon',
    marginTop: -2,
    marginRight: UNIT / 2,
  },
  pinnedActivitiesBlockTitle: {
    color: '$textSecondary',
    marginTop: UNIT,
    marginBottom: UNIT * 2,
    marginLeft: UNIT * 6.5,
  },
  pinnedActivitiesSeparator: {
    ...separator,
    marginLeft: UNIT,
    marginTop: UNIT,
    marginBottom: UNIT,
    borderColor: '$separator',
  },
  activityAvatar: {
    width: UNIT * 4,
    height: UNIT * 4,
    marginTop: UNIT / 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAvatarGroupIcon: {
    position: 'absolute',
    left: 20,
    top: 20,
    width: UNIT * 2,
    height: UNIT * 2,
    borderWidth: 1,
    borderColor: '$background',
    borderRadius: UNIT / 4,
    overflow: 'hidden',
  },
  activityAvatarIcon: {
    backgroundColor: '$iconBackground',
  },
  activityAvatarMerged: {
    backgroundColor: 'transparent',
  },
  activityAuthorInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityAuthorInfoContent: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '98%',
  },
  activityAuthorInfoContentUser: {
    color: '$textSecondary',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activityAuthorInfoContentUserName: {
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
    marginTop: UNIT,
    padding: UNIT * 1.5,
    paddingTop: UNIT * 0.75,
    backgroundColor: '$greyBackground',
    borderRadius: UNIT,
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
  activityChangeMerged: {
    marginTop: 0,
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
  },
  activityCommentActionsOther: {
    color: '$iconAccent',
  },
  activityCommentReactions: {
    alignItems: 'center',
  },
  activityCommentAttachments: {
    marginTop: UNIT,
  },
  activityIcon: {
    color: '$iconAction',
  },
  privateIcon: {
    color: '$private',
    marginRight: -UNIT / 4,
  },
  link: {
    ...secondaryText,
    color: '$link',
  },
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
  activityWorkEditIcon: {
    position: 'absolute',
    right: 0,
  },
  activityHighlighted: {
    backgroundColor: '$blueBackground',
  },
  vcsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginRight: -UNIT / 2,
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
  },
  contextMenuStartBlock: {
    height: separatorTopBorder.borderTopWidth,
    marginVertical: UNIT,
    backgroundColor: '$separator',
  },
  contextMenuItem: {
    padding: UNIT,
    minWidth: 160,
    paddingRight: 0,
    fontSize: MAIN_FONT_SIZE,
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
  contextMenuAuxiliaryPreview: {
    flexDirection: 'row',
  },
  contextMenuAuxiliaryPreviewNarrow: {
    maxWidth: 330,
  },
  contextMenuAuxiliaryPreviewText: {
    fontSize: MAIN_FONT_SIZE - 1,
    lineHeight: MAIN_FONT_SIZE + 2,
    color: '$private',
  },
  activityCommentVisibility: {
    minHeight: 50,
    padding: UNIT,
    paddingHorizontal: UNIT * 2,
  },
};
export default EStyleSheet.create(rowStyles);
