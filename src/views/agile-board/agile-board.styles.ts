import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {headerTitle, MAIN_FONT_SIZE} from 'components/common-styles';
import {separatorBorder} from 'components/common-styles/list';
import {searchInputWithMinHeight} from 'components/common-styles/search';
export default EStyleSheet.create({
  agile: {
    flex: 1,
    backgroundColor: '$background',
  },
  agileNoSprint: {
    backgroundColor: '$background',
  },
  error: {
    marginTop: UNIT * 5,
  },
  link: {
    color: '$link',
  },
  title: {
    fontSize: MAIN_FONT_SIZE + 1,
    color: '$text',
  },
  headerIconDisabled: {
    tintColor: '$icon',
  },
  boardHeaderContainer: {
    minHeight: UNIT * 5,
    overflow: 'hidden',
    backgroundColor: '$background',
    ...separatorBorder,
    borderColor: '$separator',
  },
  loadingMoreIndicator: {
    padding: UNIT * 2,
  },
  zoomButton: {
    position: 'absolute',
    zIndex: 1,
    top: UNIT * 2,
    right: UNIT * 2,
  },
  zoomButtonIcon: {
    resizeMode: 'contain',
    width: UNIT * 2,
    height: UNIT * 2,
  },
  agileBoardSmile: {
    paddingTop: UNIT * 6,
    fontSize: 36,
    color: '$text',
  },
  agileBoardMessageText: {
    paddingTop: UNIT,
    fontSize: MAIN_FONT_SIZE + 2,
    color: '$text',
  },
  selectBoardMessage: {
    paddingTop: UNIT * 2,
    fontSize: MAIN_FONT_SIZE + 2,
    color: '$link',
  },
  agileSelector: {
    width: '100%',
    minHeight: UNIT * 7,
    paddingTop: UNIT * 1.5,
    paddingLeft: UNIT * 2,
    marginRight: UNIT * 7,
    backgroundColor: '$background',
    color: '$text',
  },
  sprintSelector: {
    minHeight: UNIT * 5,
    marginLeft: UNIT * 2,
    color: '$text',
  },
  agileSelectorText: {...headerTitle, color: '$text'},
  searchQueryPreview: {
    ...searchInputWithMinHeight,
    marginHorizontal: UNIT * 2,
  },
});
