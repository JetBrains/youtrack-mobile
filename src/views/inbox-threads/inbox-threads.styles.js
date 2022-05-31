import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText, secondaryText} from 'components/common-styles/typography';
import {rowStyles as activityStyles} from 'components/activity-stream/activity__stream.styles';
import {separatorBorder} from 'components/common-styles/list';
import {UNIT} from 'components/variables/variables';

export default EStyleSheet.create({
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  thread: {
    marginTop: UNIT * 2,
    marginLeft: UNIT * 2,
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
    height: '98.5%',
    paddingBottom: UNIT * 2,
    backgroundColor: '$separator',
  },
  threadTitle: {
    marginRight: UNIT * 2,
    marginBottom: UNIT * 2,
  },
  threadSubTitle: {
    marginTop: -UNIT,
    marginLeft: UNIT * 5.5,
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
    marginBottom: UNIT,
    padding: UNIT / 2,
    paddingLeft: 0,
  },
  threadButtonMore: {
    marginTop: -UNIT,
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
