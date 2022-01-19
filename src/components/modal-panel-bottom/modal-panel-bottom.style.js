import EStyleSheet from 'react-native-extended-stylesheet';

import {HEADER_FONT_SIZE} from '../common-styles/typography';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: -UNIT * 6,
  },
  header: {
    paddingTop: UNIT * 2,
    paddingRight: UNIT * 2,
    borderColor: '$boxBackground',
    borderTopWidth: 1.5,
  },
  content: {
    paddingTop: UNIT,
    paddingLeft: UNIT * 2,
    paddingRight: UNIT,
    paddingBottom: UNIT * 3,
    backgroundColor: '$background',
  },
  title: {
    fontSize: HEADER_FONT_SIZE,
    color: '$text',
  },
  link: {
    color: '$link',
  },
});
