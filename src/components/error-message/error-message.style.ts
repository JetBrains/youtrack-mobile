import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {HEADER_FONT_SIZE, MAIN_FONT_SIZE, secondaryText} from 'components/common-styles/typography';
import {title} from '../common-styles/issue';
export const styles = EStyleSheet.create({
  errorContainer: {
    padding: UNIT * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    ...title,
    marginTop: UNIT * 2,
    color: '$text',
    textAlign: 'center',
  },
  errorDescription: {
    ...secondaryText,
    padding: UNIT * 4,
    paddingTop: UNIT * 2,
    color: '$text',
    lineHeight: HEADER_FONT_SIZE,
  },
  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT * 2,
  },
  tryAgainText: {
    fontSize: MAIN_FONT_SIZE + 2,
    color: '$link',
  },
});
