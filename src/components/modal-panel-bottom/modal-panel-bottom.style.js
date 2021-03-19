import EStyleSheet from 'react-native-extended-stylesheet';

import {HEADER_FONT_SIZE} from '../common-styles/typography';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: -UNIT * 6,
  },
  content: {
    paddingHorizontal: UNIT,
    paddingTop: UNIT,
    paddingBottom: UNIT * 3,
    backgroundColor: '$background',
    borderColor: '$boxBackground',
    borderTopWidth: 1.5,
  },
  title: {
    fontSize: HEADER_FONT_SIZE,
    color: '$text',
  },
  link: {
    color: '$link',
  },
});
