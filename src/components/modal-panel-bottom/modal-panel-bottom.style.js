import EStyleSheet from 'react-native-extended-stylesheet';

import {HEADER_FONT_SIZE} from '../common-styles/typography';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '$mask',
    marginTop: -UNIT * 6
  },
  content: {
    padding: UNIT * 2,
    paddingTop: UNIT,
    paddingBottom: UNIT * 3,
    borderTopLeftRadius: UNIT,
    borderTopRightRadius: UNIT,
    backgroundColor: '$background'
  },
  title: {
    fontSize: HEADER_FONT_SIZE,
    color: '$text'
  },
  link: {
    color: '$link'
  }
});
