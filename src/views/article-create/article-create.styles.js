import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../../components/common-styles/shadow';
import {UNIT} from '../../components/variables/variables';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  header: elevation1,
  content: {
    flex: 1,
    paddingHorizontal: UNIT * 2,
  },
  visibilitySelector: {
    marginTop: UNIT * 2.5,
    marginBottom: UNIT * 1.5
  }
});
