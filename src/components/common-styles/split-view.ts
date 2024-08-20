import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE} from './index';
import DeviceInfo from 'react-native-device-info';
export const splitViewLeftSideBarWidth = DeviceInfo.getDeviceType() === 'Desktop' ? 500 : 375;

export const splitViewStyles = {
  splitViewContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  splitViewSide: {
    flexBasis: splitViewLeftSideBarWidth,
    maxWidth: '33%',
    borderColor: '$separator',
    borderRightWidth: 1,
  },
  splitViewMain: {
    flexGrow: 1,
  },
  splitViewMainFocused: {
    backgroundColor: '$blueBackground',
  },
  splitViewMainEmpty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitViewMessage: {
    color: '$text',
    fontSize: MAIN_FONT_SIZE + 1,
  },
};
export default EStyleSheet.create(splitViewStyles);
