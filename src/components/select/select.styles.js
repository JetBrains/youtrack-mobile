import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {mainText} from '../common-styles/typography';
import {elevation1} from '../common-styles/shadow';

const minButtonWidth = UNIT * 5;

export const SELECT_ITEM_HEIGHT = UNIT * 7;
export const SELECT_ITEM_SEPARATOR_HEIGHT = 1;

export default EStyleSheet.create({
  inputWrapper: {
    ...elevation1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: UNIT * 1.5,
    backgroundColor: '$background',
  },
  cancelButton: {
    minWidth: minButtonWidth
  },
  searchInput: {
    ...mainText,
    flex: 1,
    height: UNIT * 5,
    margin: UNIT,
    color: '$text'
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: UNIT * 2,
    paddingRight: UNIT * 1.5,
    height: SELECT_ITEM_HEIGHT
  },
  rowSeparator: {
    height: SELECT_ITEM_SEPARATOR_HEIGHT,
    borderColor: '$icon',
    borderBottomWidth: 0.3,
    marginLeft: UNIT * 2
  },
  loadingRow: {
    justifyContent: 'center'
  },
  headerText: {
    color: '$text'
  },
  selectItemValue: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemIcon: {
    marginRight: UNIT * 2
  },
  itemTitle: {
    ...mainText,
    fontWeight: '500',
    color: '$text'
  },
  loadingMessage: {
    paddingLeft: UNIT * 2,
    color: '$textSecondary'
  },
  selectedMarkIcon: {
    width: UNIT * 3,
    height: UNIT * 3,
    resizeMode: 'contain'
  },
  colorFieldItemWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  colorField: {
    marginRight: UNIT * 2
  },
  applyButton: {
    minWidth: minButtonWidth,
    padding: UNIT,
    paddingLeft: UNIT * 2
  }
});
