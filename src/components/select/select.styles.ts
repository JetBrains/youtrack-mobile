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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  error: {
    color: '$error',
    borderColor: '$error',
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
    height: SELECT_ITEM_HEIGHT,
    position: 'relative',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemWrapper: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemIcon: {
    marginRight: UNIT * 2,
  },
  itemIconSecondary: {
    position: 'absolute',
    left: 21,
    bottom: 8,
    width: UNIT * 2,
    height: UNIT * 2,
    borderWidth: 1,
    borderColor: '$background',
    borderRadius: UNIT / 4,
    overflow: 'hidden',
  },
  itemIconSelected: {
    height: '90%',
    justifyContent: 'center',
    marginLeft: UNIT,
    paddingLeft: UNIT,
    backgroundColor: '$background',
  },
  itemTitle: {
    flex: 1,
    fontSize: MAIN_FONT_SIZE,
    color: '$text',
  },
  itemStar: {
    marginRight: UNIT,
    padding: UNIT / 2,
    paddingLeft: 0,
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
    marginRight: UNIT,
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
  description: {
    ...secondaryText,
    color: '$textSecondary',
  },

});
