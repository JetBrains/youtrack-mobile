import EStyleSheet from 'react-native-extended-stylesheet';

import {headerTitle, layout, MAIN_FONT_SIZE, mainText, SECONDARY_FONT_SIZE, UNIT} from 'components/common-styles';
import {separator} from 'components/common-styles/list';


export default EStyleSheet.create({
  ...layout,
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  content: {
    paddingLeft: UNIT,
  },
  title: {
    paddingLeft: UNIT * 2,
    ...headerTitle,
    color: '$text',
  },
  issueSummary: {
    marginTop: UNIT,
    marginHorizontal: UNIT * 2,
    paddingBottom: UNIT * 5,
  },
  issueAttachments: {
    marginBottom: UNIT,
  },
  creatingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20,
  },
  separator: {
    height: 1,
    marginVertical: UNIT,
    ...separator,
    borderColor: '$separator',
  },
  separatorWithMargin: {
    marginTop: UNIT * 4,
  },
  additionalData: {
    marginHorizontal: UNIT * 2,
  },
  imageActivityIndicator: {
    backgroundColor: '$mask',
    position: 'absolute',
    top: 0,
    left: 0,
    right: UNIT,
    bottom: 0,
  },
  selectProjectButton: {
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 2,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  selectProjectText: {
    color: '$text',
    fontSize: MAIN_FONT_SIZE,
    flexShrink: 2,
  },
  selectProjectIcon: {
    alignSelf: 'flex-end',
    marginLeft: UNIT,
    width: UNIT * 2,
    height: UNIT * 2,
  },
  visibility: {
    marginTop: UNIT * 3,
    marginLeft: UNIT * 2,
    marginBottom: UNIT * 2,
  },
  textFields: {
    marginLeft: UNIT * 2,
    paddingRight: UNIT * 2,
  },
  addLinkButton: {
    flexDirection: 'row',
    paddingVertical: UNIT * 1.5,
  },
  addLinkButtonText: {...mainText, marginLeft: UNIT * 1.8, color: '$link'},
  addLinkButtonTextDisabled: {
    color: '$textSecondary',
  },
  link: {
    color: '$link',
  },
  applyButton: {
    padding: UNIT / 4,
    paddingRight: 0,
  },
  moreActionsButton: {
    paddingTop: UNIT / 4,
  },
  draftsButton: {
    paddingTop: UNIT / 4,
    marginRight: UNIT * 2.5,
  },
  draftsDeleteAllButton: {
    padding: UNIT,
  },
  draftsButtonText: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$link',
  },
  draftsItem: {
    backgroundColor: '$background',
  },
});
