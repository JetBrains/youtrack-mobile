import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: '$background',
  },
  container: {
    flex: 1,
    paddingVertical: UNIT,
    paddingHorizontal: UNIT * 2,
  },
});
