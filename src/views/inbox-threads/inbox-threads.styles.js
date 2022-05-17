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
    marginBottom: UNIT,
    paddingBottom: UNIT / 2,
    ...separatorBorder,
    borderColor: '$separator',
  },
  threadLast: {
    marginTop: UNIT * 2,
    marginLeft: UNIT * 2,
    marginBottom: UNIT,
    paddingBottom: UNIT / 2,
    borderBottomWidth: 0,
  },
  threadConnector: {
    position: 'absolute',
    top: 4,
    left: 16,
    width: 3,
    height: '100%',
    paddingBottom: UNIT * 2,
    backgroundColor: '$boxBackground',
  },
  threadTitle: {
    marginRight: UNIT * 2,
    marginBottom: UNIT * 2,
  },
  threadTitleIcon: {
    position: 'relative',
    zIndex: 1,
    marginRight: UNIT * 1.5,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: UNIT / 2,
    backgroundColor: '$boxBackground',
  },
  threadChange: {
    ...activityStyles.activityRelatedChanges,
    paddingTop: UNIT / 4,
    paddingBottom: UNIT,

    marginLeft: UNIT * 6,
    marginRight: UNIT * 2,
    marginBottom: UNIT * 3.5,
  },
  threadChangeMarkdown: {
    paddingTop: 0,
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
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
});
