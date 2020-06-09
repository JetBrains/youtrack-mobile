import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_BLACK,
  COLOR_FONT_GRAY,
  COLOR_FONT,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_PINK_DARK
} from '../../components/variables/variables';
import {headerTitle, mainText, secondaryText} from '../../components/common-styles/typography';
import {elevation1} from '../../components/common-styles/shadow';


export default StyleSheet.create({
  secondaryText: secondaryText,
  container: {
    flex: 1
  },
  issueContent: {
    backgroundColor: COLOR_FONT_ON_BLACK,
  },
  headerText: {
    ...headerTitle,
    fontWeight: '500'
  },
  headerTextResolved: {
    color: COLOR_ICON_MEDIUM_GREY,
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
    marginTop: UNIT * 2,
    padding: UNIT * 2
  },
  issueTopPanel: {
    paddingTop: UNIT / 4
  },
  issueTopPanelText: {
    ...secondaryText
  },
  issueTopPanelMoreIcon: {
    height: 9,
    resizeMode: 'contain',
    tintColor: `${COLOR_FONT}${70}`
  },
  topPanelUpdatedInformation: {
    marginTop: UNIT * 0.75,
    marginBottom: UNIT * 2
  },
  summary: {
    paddingTop: UNIT,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.19,
    color: COLOR_BLACK
  },
  tags: {
    marginTop: UNIT * 2
  },
  description: {
    marginTop: UNIT * 2,
  },
  attachments: {
    marginTop: UNIT * 2,
  },
  loadingActivityError: {
    marginTop: UNIT * 2,
    color: COLOR_PINK_DARK,
    textAlign: 'center'
  },
  disabledSaveButton: {
    color: COLOR_FONT_GRAY
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
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  tabLabel: {
    ...mainText,
    paddingTop: UNIT,
    paddingBottom: UNIT,
    fontWeight: '500',
    textTransform: 'none'
  },
  tabLazyPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  issueAdditionalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  issueAdditionalInfo: {
    flex: 1
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
