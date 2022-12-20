import {UNIT} from '../variables/variables';
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
  paddingLeft: UNIT / 1.5,
  paddingVertical: UNIT * 1.6,
  marginHorizontal: UNIT,
  ...mainText,
  color: '$text',
};
export const clearIcon = {
  marginLeft: UNIT,
  marginRight: UNIT * 2,
  color: '$icon',
};