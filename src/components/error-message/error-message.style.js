import {StyleSheet} from 'react-native';
import {COLOR_PINK, UNIT} from '../variables/variables';
import {secondaryText, title} from '../common-styles/issue';

export const styles = StyleSheet.create({
  errorContainer: {
    padding: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    ...title,
  },
  errorDescription: {
    padding: UNIT * 4,
    paddingTop: UNIT * 2,
    ...secondaryText,
    lineHeight: 20,
  },
  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT * 2
  },
  tryAgainText: {
    fontSize: 18,
    color: COLOR_PINK
  }
});
