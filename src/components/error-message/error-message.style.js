import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {secondaryText} from '../common-styles/typography';
import {title} from '../common-styles/issue';

export const styles = EStyleSheet.create({
  errorContainer: {
    padding: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    marginTop: UNIT * 1.5,
    ...title,
    color: '$text'
  },
  errorDescription: {
    padding: UNIT * 4,
    paddingTop: UNIT * 2,
    ...secondaryText,
    color: '$icon',
    lineHeight: 20,
  },
  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT * 2
  },
  tryAgainText: {
    fontSize: 18,
    color: '$link'
  }
});
