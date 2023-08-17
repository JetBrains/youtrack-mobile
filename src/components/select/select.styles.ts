import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1, mainText, secondaryText} from 'components/common-styles';
import {inputWrapper, searchInputWithMinHeight} from 'components/common-styles/search';
import {MAIN_FONT_SIZE} from 'components/common-styles/typography';
import {separator} from 'components/common-styles/list';
import {UNIT} from 'components/variables';

const minButtonWidth = UNIT * 5;
export const SELECT_ITEM_HEIGHT = UNIT * 7;
export const SELECT_ITEM_SEPARATOR_HEIGHT = 1;


export default EStyleSheet.create({
  inputWrapper: {
    ...inputWrapper,
    ...elevation1,
    backgroundColor: '$background',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cancelButton: {
    minWidth: minButtonWidth,
    paddingLeft: UNIT,
    color: '$link',
  },
  searchInput: {
    ...searchInputWithMinHeight,
    margin: UNIT,
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: UNIT * 2,
    paddingRight: UNIT * 2,
    height: SELECT_ITEM_HEIGHT,
  },
  rowSeparator: {
    borderColor: '$separator',
    ...separator,
  },
  loadingRow: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    bottom: 0,
    left: -UNIT * 4,
    right: 0,
    height: '100%',
    justifyContent: 'center',
  },
  headerText: {
    color: '$text',
  },
  selectItemValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: UNIT * 2,
  },
  itemIconSelected: {
    height: '90%',
    justifyContent: 'center',
    marginLeft: UNIT,
    paddingLeft: UNIT,
    backgroundColor: '$background',
  },
  itemTitle: {
    fontSize: MAIN_FONT_SIZE,
    color: '$text',
  },
  itemStar: {
    marginRight: UNIT * 1.5,
    padding: UNIT / 2,
    paddingRight: UNIT,
  },
  loadingMessage: {
    paddingLeft: UNIT * 2,
    color: '$textSecondary',
  },
  selectedMarkIcon: {
    width: UNIT * 3,
    height: UNIT * 3,
    resizeMode: 'contain',
  },
  colorFieldItemWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorField: {
    marginRight: UNIT * 2,
  },
  applyButton: {
    minWidth: minButtonWidth,
    padding: UNIT,
    paddingHorizontal: UNIT * 2,
  },
  link: {
    color: '$link',
  },
  placeholder: {
    color: '$icon',
  },
  note: {
    maxHeight: UNIT * 7,
    alignItems: 'center',
  },
  modalPortalSelectContent: {
    paddingBottom: SELECT_ITEM_HEIGHT,
  },

  sectionHeader: {
    marginTop: 2,
    padding: UNIT,
    paddingLeft: UNIT * 2,
    backgroundColor: '$boxBackground',
  },
  sectionHeaderEmpty: {
    height: 7,
    padding: 0,
  },
  searchText: {...mainText, fontWeight: '500', color: '$text'},
  sectionHeaderText: {
    textTransform: 'uppercase',
    ...secondaryText,
    color: '$textSecondary',
  },
  list: {
    paddingBottom: UNIT * 4,
  },
});
