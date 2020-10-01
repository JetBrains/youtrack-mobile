import {Platform} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../../components/variables/variables';
import {headerTitle, mainText, secondaryText} from '../../components/common-styles/typography';
import {elevation1} from '../../components/common-styles/shadow';
import {summary} from '../../components/issue-summary/issue-summary.styles';
import {separatorBorder} from '../../components/common-styles/list';

const centered = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
};

export default EStyleSheet.create({
  secondaryText: secondaryText,
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  headerText: {
    ...headerTitle,
    color: '$text',
    fontWeight: '500',
    ...Platform.select({
      ios: {
        marginLeft: UNIT / 2,
      },
      android: {
        marginLeft: UNIT * 1.3,
      }
    })
  },
  headerTextResolved: {
    color: '$icon',
    textDecorationLine: 'line-through'
  },
  issueStar: {
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2
  },
  savingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20
  },
  issueView: {
    marginTop: UNIT,
    padding: UNIT * 2
  },
  issueTopPanel: {
    paddingTop: UNIT / 4,
    marginBottom: UNIT * 2
  },
  issueTopPanelText: {
    ...secondaryText,
    color: '$icon'
  },
  tags: {
    marginTop: UNIT * 2
  },
  tagsSeparator: {
    height: UNIT,
    marginRight: -UNIT * 2,
    ...separatorBorder,
    borderColor: '$separator'
  },
  topPanelUpdatedInformation: {
    marginTop: UNIT * 0.75,
  },
  summary: {
    ...summary,
    paddingTop: UNIT,
    color: '$text'
  },
  description: {
    marginTop: UNIT * 2,
    color: '$text'
  },
  attachments: {
    marginTop: UNIT * 2,
  },
  loadingActivityError: {
    marginTop: UNIT * 2,
    color: '$error',
    textAlign: 'center'
  },
  disabledSaveButton: {
    color: '$icon'
  },

  row: {
    flexDirection: 'row',
    flex: 1
  },
  alignedRight: {
    marginRight: UNIT
  },

  tabsBar: {
    ...elevation1,
    backgroundColor: '$background'
  },
  tabLabel: {
    ...mainText,
    paddingTop: UNIT,
    paddingBottom: UNIT,
    fontWeight: '500',
    textTransform: 'none',

    ...Platform.select({
      ios: {},
      android: {
        fontSize: 18,
        fontWeight: '400',
      }
    })
  },
  tabLabelActive: {
    fontWeight: '400',
  },
  tabLazyPlaceholder: {
    ...centered
  },
  issueAdditionalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  issueAdditionalInfo: {
    flex: 1
  },
  switchToActivityButton: {
    marginTop: UNIT * 4,
    ...centered,
  },
  switchToActivityButtonText: {
    ...mainText,
    color: '$link',
    padding: UNIT,
    marginBottom: UNIT * 3
  },
  visibility: {
    marginBottom: UNIT
  }
});
