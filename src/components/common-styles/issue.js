import {StyleSheet} from 'react-native';

import {
  COLOR_FONT_GRAY,
} from '../../components/variables/variables';


export const resolvedTextColor = {
  color: COLOR_FONT_GRAY
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
