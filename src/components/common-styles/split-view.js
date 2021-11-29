import {MAIN_FONT_SIZE} from './typography';

export const splitViewStyles = {
  splitViewContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  splitViewSide: {
    flexBasis: 375,
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
