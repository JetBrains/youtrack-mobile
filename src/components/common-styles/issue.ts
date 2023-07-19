import {UNIT} from 'components/variables';
import {HEADER_FONT_SIZE, MAIN_FONT_SIZE, mainText, secondaryText} from './typography';
import {Platform} from 'react-native';
export const title = {
  fontSize: MAIN_FONT_SIZE + 2,
  fontWeight: '500',
  lineHeight: HEADER_FONT_SIZE + 1,
  letterSpacing: -0.22,
};
export const issueCard = {
  issueId: {
    flexShrink: 0,
    flexGrow: 0,
    ...secondaryText,
  },
  issueSummary: {
    ...mainText,
    flex: 1,
    ...Platform.select({
      ios: {
        fontWeight: '500',
      },
      android: {
        fontWeight: '$androidSummaryFontWeight',
      },
    }),
  },
};
export const issueIdResolved = {
  textDecorationLine: 'line-through',
};
export const summaryTitle = {
  flex: 1,
  marginTop: UNIT,
  fontSize: HEADER_FONT_SIZE,
  lineHeight: HEADER_FONT_SIZE + 4,
  letterSpacing: -0.19,
  ...Platform.select({
    ios: {
      fontWeight: '500',
    },
    android: {
      fontWeight: '$androidSummaryFontWeight',
    },
  }),
};
