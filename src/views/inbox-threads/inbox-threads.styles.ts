import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {baseHeaderStyles} from 'components/header/header.styles';
import {rowStyles as activityStyles} from 'components/activity-stream/activity__stream.styles';
import {secondaryText, UNIT} from 'components/common-styles';
import {splitViewStyles} from 'components/common-styles/split-view';

export default EStyleSheet.create({
  ...splitViewStyles,
  ...baseHeaderStyles,
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  icon: {
    color: '$iconAction',
  },
  iconAddReaction: {
    color: '$iconAccent',
  },
  avatarComment: {
    backgroundColor: '$background',
  },
  link: {
    color: '$link',
  },
  disabled: {
    color: '$disabled',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  threadsList: {
    paddingTop: UNIT,
  },
  threadsEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadsEmptyText: {
    color: '$text',
  },
  thread: {
    marginTop: UNIT * 1.5,
  },
  threadContainer: {
    paddingLeft: UNIT * 1.5,
    backgroundColor: '$background',
  },
  threadFirstMerged: {
    marginTop: 0,
  },
  threadSeparator: {
    marginLeft: UNIT * 2,
    marginBottom: UNIT,
    borderBottomWidth: 1,
    borderColor: '$separator',
  },
  threadLast: {
    borderBottomWidth: 0,
  },
  threadConnector: {
    position: 'absolute',
    zIndex: -1,
    top: UNIT / 2,
    left: 19,
    width: 2,
    height: '98.5%',
    paddingBottom: UNIT * 2,
    opacity: 0.25,
    backgroundColor: '$iconAction',
  },
  threadTitleContainer: {
    paddingLeft: UNIT * 2,
    alignItems: 'baseline',
  },
  threadTitleContainerBottom: {
    paddingLeft: UNIT / 4,
    alignItems: 'baseline',
  },
  threadTitleContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  threadTitle: {
    maxWidth: '85%',
    marginBottom: UNIT * 2,
  },
  threadSubTitle: {
    maxWidth: '76%',
    marginTop: -UNIT / 2,
    marginLeft: UNIT * 5.5,
  },
  threadTitleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -UNIT / 4,
    marginRight: UNIT,
    marginLeft: -UNIT * 8,
  },
  threadTitleAction: {
    width: 30,
    height: 29,
    marginLeft: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: UNIT * 2,
  },
  threadItemAction: {
    borderRadius: UNIT * 2,
    position: 'absolute',
    zIndex: 1,
    top: UNIT / 4,
    right: 2,
    padding: UNIT * 1.5,
  },
  threadItemActionWithSettings: {
    top: UNIT * 5,
    marginRight: UNIT / 2,
  },
  threadMuteToggle: {
    padding: UNIT / 2,
  },
  threadSubTitleText: {...secondaryText, color: '$textSecondary'},
  threadChange: {
    marginLeft: UNIT * 5.5,
    marginRight: UNIT * 2,
    marginBottom: UNIT * 1.5,
  },
  threadChangeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -UNIT,
    marginBottom: UNIT,
    marginLeft: UNIT * 5.5,
    marginRight: UNIT * 1.5,
  },
  threadRelatedChange: {
    ...activityStyles.activityRelatedChanges,
    marginBottom: UNIT * 2,
    paddingTop: UNIT / 4,
    paddingBottom: UNIT,
  },
  threadChangeMarkdown: {
    paddingTop: 0,
  },
  threadReactions: {
    marginBottom: UNIT,
  },
  threadReactionsList: {
    marginRight: UNIT,
    alignItems: 'center',
  },
  threadReactionsAddButton: {
    position: 'absolute',
    zIndex: 1,
    bottom: UNIT * 2,
    right: UNIT * 2,
  },
  threadReactionsAddIcon: {
    marginTop: UNIT / 2,
    padding: UNIT / 2,
    paddingLeft: 0,
  },
  threadButton: {
    marginBottom: UNIT * 1.5,
    padding: UNIT / 2,
    paddingLeft: 0,
  },
  threadButtonMore: {
    marginTop: -UNIT * 1.5,
    marginBottom: UNIT * 2,
    marginLeft: UNIT * 5.5,
  },
  threadButtonText: {
    color: '$textSecondary',
  },
  tabTitleIconUnread: {
    position: 'absolute',
    top: UNIT / 4,
    right: -UNIT / 4,
  },
  threadUpdateButtonContainer: {
    zIndex: 1,
  },
  threadUpdateButton: {
    position: 'absolute',
    zIndex: 1,
    top: UNIT * 8.5,
    alignSelf: 'center',
    paddingVertical: UNIT,
    paddingHorizontal: UNIT * 2.5,
    borderRadius: UNIT * 3,
    backgroundColor: '$link',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowRadius: 2,
    shadowOpacity: 0.3,
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 1,
        },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  threadUpdateButtonText: {...secondaryText, color: '$textButton'},
});
