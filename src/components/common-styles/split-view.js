export const splitViewStyles = {
  splitViewContainer: {
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
};
