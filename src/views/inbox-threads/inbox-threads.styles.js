import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText, secondaryText} from 'components/common-styles/typography';
import {rowStyles as activityStyles} from 'components/activity-stream/activity__stream.styles';
import {separatorBorder} from 'components/common-styles/list';
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
  thread: {
    marginTop: UNIT * 2,
    marginLeft: UNIT * 2,
  },
  threadFirst: {
    marginTop: UNIT,
  },
  threadSeparator: {
    marginLeft: UNIT * 2,
    marginBottom: UNIT,
    ...separatorBorder,
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
  threadRelatedChange: {
    ...activityStyles.activityRelatedChanges,
    marginBottom: UNIT * 2,
    paddingTop: UNIT / 4,
    paddingBottom: UNIT,
  },
  threadChangeMarkdown: {
    paddingTop: 0,
  },
  threadCommentReactions: {
    marginBottom: UNIT * 2,
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
});
