import {StyleSheet} from 'react-native';

import {
  COLOR_DARK,
  COLOR_FONT_GRAY,
  COLOR_ICON_MEDIUM_GREY,
  UNIT,
} from '../../components/variables/variables';


export const resolvedTextColor = {
  color: COLOR_FONT_GRAY
};

export const secondaryText = {
  color: COLOR_ICON_MEDIUM_GREY,
  fontSize: 14,
  letterSpacing: -0.17
};

export const mainText = {
  fontSize: 16,
  lineHeight: 20,
  letterSpacing: -0.19
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
    marginTop: UNIT,
    color: COLOR_DARK,
    fontWeight: '500',
  }
};

export default StyleSheet.create({
  resolved: {
    ...resolvedTextColor
  },
  resolvedSummary: {
    ...resolvedTextColor,
    fontWeight: '200'
  }
});
