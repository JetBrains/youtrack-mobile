import EStyleSheet from 'react-native-extended-stylesheet';
import {issueIdResolved} from 'components/common-styles/issue';
import {
  headerTitle,
  mainText,
  secondaryText,
} from 'components/common-styles';
import {separatorBorder} from 'components/common-styles/list';
import {summary} from 'components/form/summary-description-form.style';
import {UNIT} from 'components/variables';
const centered = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  secondaryText: secondaryText,
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  header: {
    paddingHorizontal: UNIT * 2,
  },
  headerExtraContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {...headerTitle, color: '$text'},
  headerTextResolved: {...issueIdResolved, color: '$textSecondary'},
  issueStar: {
    marginLeft: UNIT * 2,
    marginRight: UNIT * 1.5,
  },
  savingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20,
  },
  issueView: {
    marginTop: UNIT,
    padding: UNIT * 2,
  },
  issueTopPanel: {
    paddingTop: UNIT / 4,
    marginBottom: UNIT * 2,
  },
  issueTopPanelText: {...secondaryText, color: '$textSecondary'},
  tags: {
    marginRight: -UNIT * 2,
    paddingRight: UNIT * 2,
    marginTop: UNIT * 1.5,
    paddingTop: UNIT / 2,
    paddingBottom: UNIT * 1.5,
    ...separatorBorder,
    borderColor: '$separator',
  },
  topPanelUpdatedInformation: {
    marginTop: UNIT * 0.75,
  },
  summary: {...summary, paddingTop: UNIT, color: '$text'},
  summaryResolved: {
    color: '$textSecondary',
  },
  description: {
    marginTop: UNIT,
  },
  attachments: {
    marginTop: UNIT * 2,
  },
  loadingActivityError: {
    marginTop: UNIT * 2,
    color: '$error',
    textAlign: 'center',
  },
  disabledSaveButton: {
    color: '$icon',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  alignedRight: {
    marginRight: UNIT,
  },
  issueTopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  issueVote: {
    flexShrink: 0,
    minWidth: UNIT * 8,
    marginRight: UNIT,
  },
  switchToActivityButton: {
    marginTop: UNIT * 4,
    ...centered,
  },
  switchToActivityButtonText: {
    ...mainText,
    color: '$link',
    padding: UNIT,
    marginBottom: UNIT * 3,
  },
  visibility: {
    flexShrink: 1,
    flex: 1,
  },
  issueTagSelectItem: {
    paddingHorizontal: UNIT / 2,
    paddingVertical: UNIT / 4,
  },
  iconMore: {
    position: 'absolute',
    top: -9,
  },
  link: {
    color: '$link',
  },
  issueModalCloseIcon: {
    paddingHorizontal: UNIT,
  },
});
