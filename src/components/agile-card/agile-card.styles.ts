import EStyleSheet from 'react-native-extended-stylesheet';
import {issueCard, issueIdResolved} from '../common-styles/issue';
import {secondaryText} from 'components/common-styles/typography';
import {UNIT} from 'components/variables';
export const agileCard = {
  flexDirection: 'row',
  marginLeft: UNIT * 2,
  borderRadius: UNIT,
  overflow: 'hidden',
  backgroundColor: '$boxBackground',
};
export default EStyleSheet.create({
  card: agileCard,
  cardColorCoding: {
    flexShrink: 0,
    marginTop: UNIT / 4,
    marginBottom: UNIT / 4,
    width: UNIT / 2,
    borderTopLeftRadius: UNIT,
    borderBottomLeftRadius: UNIT,
  },
  cardContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    padding: UNIT * 1.75,
    paddingTop: UNIT * 1.5,
  },
  cardContainerNotZoomed: {
    padding: UNIT,
    paddingTop: UNIT,
  },
  cardContent: {
    flexDirection: 'column',
  },
  issueHeader: {
    flexDirection: 'row',
  },
  issueHeaderLeft: {
    flexGrow: 1,
  },
  issueContent: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  issueSummary: {
    flexGrow: 1,
    color: '$text',
  },
  ghost: {
    display: 'none',
  },
  dragging: {
    width: '80%',
    transform: [
      {
        rotate: '-3deg',
      },
    ],
    borderWidth: 2,
    borderColor: '$iconAccent',
  },
  estimation: {
    marginRight: UNIT,
    ...secondaryText,
    color: '$icon',
  },
  summary: {
    flexGrow: 1,
    ...issueCard.issueSummary,
    marginTop: UNIT,
  },
  issueId: {...issueCard.issueId, color: '$icon'},
  issueIdResolved: {...issueIdResolved},
  assignees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignee: {
    marginLeft: UNIT / 2,
  },
  tags: {
    flexGrow: 0,
    overflow: 'hidden',
    height: UNIT * 3.5,
    marginTop: UNIT / 2,
  },
  zoomedInText: {
    fontSize: 11,
  },
}) as any;
