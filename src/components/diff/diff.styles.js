import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  button: {
    flexDirection: 'row'
  },
  diffInsert: {
    backgroundColor: '#E6FFE6'
  },
  diffDelete: {
    backgroundColor: '#FFE6E6'
  },
  diffEqual: {
    color: '$icon'
  },
  title: {
    color: '$border'
  },
  toggle: {
    color: '$link'
  },
  content: {
    paddingTop: UNIT,
    paddingBottom: UNIT
  },
  icon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    color: '$link'
  }
});
