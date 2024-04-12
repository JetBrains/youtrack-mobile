import EStyleSheet from 'react-native-extended-stylesheet';

import {COLOR_FIELD_SIZE} from 'components/color-field/color-field';
import {elevation1, mainText, secondaryText} from 'components/common-styles';
import {inputWrapper, searchInputWithMinHeight} from 'components/common-styles/search';
import {MAIN_FONT_SIZE} from 'components/common-styles/typography';
import {separator} from 'components/common-styles/list';
import {UNIT} from 'components/variables';

const minButtonWidth = UNIT * 5;
export const SELECT_ITEM_HEIGHT = UNIT * 7;
export const SELECT_ITEM_SEPARATOR_HEIGHT = 1;


export default EStyleSheet.create({
  select: {
    width: '100%',
    height: '100%',
    backgroundColor: '$background',
  },
  container: {
    minWidth: '50%',
    minHeight: '50%',
  },
  inputWrapper: {
    ...inputWrapper,
    ...elevation1,
    backgroundColor: '$background',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cancelButton: {
    color: '$link',
  },
  searchInput: {
    ...searchInputWithMinHeight,
    margin: UNIT,
  },
  customInput: {
    ...searchInputWithMinHeight,
    paddingLeft: UNIT,
    marginVertical: UNIT * 2,
    marginLeft: UNIT * 2,
    minHeight: UNIT * 6,
    backgroundColor: '$boxBackground',
    borderRadius: UNIT,
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: UNIT * 2,
    paddingRight: UNIT,
    height: SELECT_ITEM_HEIGHT,
  },
  rowSeparator: {
    borderColor: '$separator',
    ...separator,
  },
  footer: {
    height: '90%',
    alignItems: 'center',
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
    minWidth: COLOR_FIELD_SIZE,
    marginRight: UNIT * 1.5,
  },
  applyButton: {
    minWidth: minButtonWidth,
    padding: UNIT,
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
    paddingBottom: SELECT_ITEM_HEIGHT * 1.5,
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
    minWidth: '50%',
    paddingBottom: UNIT * 4,
  },
});
