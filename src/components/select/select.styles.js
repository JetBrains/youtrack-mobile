import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../common-styles/shadow';
import {inputWrapper} from '../common-styles/search';
import {MAIN_FONT_SIZE} from '../common-styles/typography';
import {separator} from '../common-styles/list';
import {UNIT} from '../variables/variables';

const minButtonWidth = UNIT * 5;

export const SELECT_ITEM_HEIGHT = UNIT * 7;
export const SELECT_ITEM_SEPARATOR_HEIGHT = 1;

export default EStyleSheet.create({
  inputWrapper: {
    ...inputWrapper,
    ...elevation1,
    backgroundColor: '$background',
  },
  cancelButton: {
    minWidth: minButtonWidth,
    color: '$link',
  },
  searchInput: {
    flex: 1,
    paddingVertical: UNIT * 1.5,
    margin: UNIT,
    fontSize: MAIN_FONT_SIZE,
    color: '$text',
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: UNIT * 2,
    paddingRight: UNIT * 1.5,
    height: SELECT_ITEM_HEIGHT,
  },
  rowSeparator: {
    borderColor: '$separator',
    ...separator,
  },
  loadingRow: {
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
  itemTitle: {
    fontSize: MAIN_FONT_SIZE,
    color: '$text',
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
    paddingLeft: UNIT * 2,
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
});
