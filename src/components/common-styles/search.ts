import {UNIT} from 'components/variables';
import {mainText} from './typography';
export const inputWrapper = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingLeft: UNIT,
  borderRadius: UNIT,
  backgroundColor: '$boxBackground',
};
export const searchInput = {
  flex: 1,
  padding: 0,
  marginHorizontal: UNIT,
  ...mainText,
  color: '$text',
};
export const searchInputWithMinHeight = {
  ...searchInput,
  height: UNIT * 5.5,
};
export const clearIcon = {
  marginLeft: UNIT,
  marginRight: UNIT * 2,
  color: '$icon',
};
