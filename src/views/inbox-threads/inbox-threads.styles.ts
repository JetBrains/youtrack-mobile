import {Platform} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {mainText, secondaryText} from 'components/common-styles';
import {rowStyles as activityStyles} from 'components/activity-stream/activity__stream.styles';
import {splitViewStyles} from 'components/common-styles/split-view';
import {UNIT} from 'components/variables';
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
    borderColor: '$separator',
  },
  threadLast: {
    borderBottomWidth: 0,
  },
  threadConnector: {
    position: 'absolute',
    top: UNIT / 2,
    left: 15,
    width: 2,
    height: '98%',
    paddingBottom: UNIT * 2,
    backgroundColor: '$separator',
  },
  threadTitleContainer: {
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
    marginTop: -UNIT,
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
    width: 24,
    height: 24,
    marginLeft: UNIT,
    marginRight: UNIT / 4,
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
  threadMuteToggle: {
    padding: UNIT / 2,
  },
  threadSubTitleText: {...secondaryText, color: '$icon'},
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
  threadChangeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
