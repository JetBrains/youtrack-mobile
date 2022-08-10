import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText, secondaryText} from 'components/common-styles/typography';
import {rowStyles as activityStyles} from 'components/activity-stream/activity__stream.styles';
import {splitViewStyles} from 'components/common-styles/split-view';
import {UNIT} from 'components/variables/variables';

export default EStyleSheet.create({
  ...splitViewStyles,
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  icon: {
    color: '$iconAccent',
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
    flexGrow: 1,
  },
  threadsListContainer: {
    flexGrow: 1,
  },
  threadsEmpty: {
    height: '100%',
    alignItems: 'center',
    marginTop: -UNIT * 5,
    justifyContent: 'center',
  },
  threadsEmptyText: {
    color: '$text',
  },
  thread: {
    marginTop: UNIT * 1.5,
    marginLeft: UNIT * 2,
  },
  threadFirst: {
    marginTop: UNIT,
  },
  threadSeparator: {
    marginLeft: UNIT * 2,
    marginBottom: UNIT,
    borderBottomWidth: 1,
    borderColor: '$greyBackground',
  },
  threadLast: {
    borderBottomWidth: 0,
  },
  threadConnector: {
    position: 'absolute',
    top: UNIT / 2,
    left: 15,
    width: 2,
    height: '99%',
    paddingBottom: UNIT * 2,
    backgroundColor: '$separator',
  },
  threadTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  threadTitle: {
    flexGrow: 1,
    marginRight: UNIT * 10,
    marginBottom: UNIT * 2,
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
    width: 24,
    height: 24,
    marginLeft: UNIT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadItemAction: {
    position: 'absolute',
    zIndex: 1,
    top: UNIT / 4,
    right: UNIT / 1.5,
    padding: UNIT,
  },
  threadSubTitle: {
    marginTop: -UNIT,
    marginLeft: UNIT * 5.5,
    marginRight: UNIT * 2,
  },
  threadMuteToggle: {
    padding: UNIT / 2,
  },
  threadSubTitleText: {
    ...secondaryText,
    color: '$icon',
  },
  threadTitleIcon: {
    position: 'relative',
    zIndex: 1,
    top: -UNIT / 4,
    marginLeft: -UNIT / 2,
    marginRight: UNIT * 1.5 - UNIT / 2,
    width: UNIT * 5,
    height: UNIT * 5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$boxBackground',
    borderWidth: UNIT / 2,
    borderColor: '$background',
    borderRadius: UNIT,
  },
  threadChange: {
    marginLeft: UNIT * 5.5,
    marginRight: UNIT * 2,
    marginBottom: UNIT * 1.5,
  },
  threadChangeWrapper: {
    alignItems: 'baseline',
    marginTop: -UNIT,
    marginBottom: UNIT,
    marginLeft: UNIT * 5.5,
    marginRight: UNIT * 2,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: UNIT / 2,
  },
  threadReactionsList: {
    marginRight: UNIT,
    alignItems: 'center',
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
    color: '$icon',
  },
  threadChangeReason: {
    marginRight: UNIT / 2,
    ...secondaryText,
    color: '$icon',
  },
  threadChangeAuthor: {
    flexGrow: 1,
    flexShrink: 0,
    ...mainText,
    color: '$text',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  tabTitleIconUnread: {
    position: 'absolute',
    top: UNIT - 1,
    right: -UNIT / 2,
  },
  threadUpdateButton: {
    position: 'absolute',
    zIndex: 1,
    top: UNIT * 3,
    alignSelf: 'center',
    paddingVertical: UNIT / 1.5,
    paddingHorizontal: UNIT * 3,
    borderRadius: UNIT * 3,
    backgroundColor: '$link',
    ...Platform.select({
      ios: {
        shadowColor: '$icon',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 9,
      },
    }),
  },
  threadUpdateButtonText: {
    ...secondaryText,
    color: '$textButton',
  },
});
