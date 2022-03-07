import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables/variables';
import {headerTitle, monospace, SECONDARY_FONT_SIZE} from 'components/common-styles/typography';


export default EStyleSheet.create({
  headerTitle: {
    ...headerTitle,
  },
  container: {
    flex: 1,
    backgroundColor: '$background',
  },
  wiki: {
    paddingHorizontal: UNIT * 2,
  },
  plainText: {
    color: '$text',
    fontSize: SECONDARY_FONT_SIZE,
    ...monospace,
  },
});
