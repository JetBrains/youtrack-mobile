import {
  COLOR_MEDIUM_GRAY,
  UNIT
} from '../variables/variables';


export const separatorBorder = {
  borderBottomWidth: 0.5,
  borderColor: COLOR_MEDIUM_GRAY
};

export const separator = {
  height: 1,
  marginLeft: UNIT * 2,
  ...separatorBorder
};
