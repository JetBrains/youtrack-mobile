import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  tags: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  tagsMultiline: {
    flexWrap: 'wrap'
  },
  tag: {
    marginBottom: UNIT / 4,
    marginRight: UNIT
  },
  tagMultiline: {
    marginBottom: UNIT,
  },
  tagNoColor: {
    borderWidth: 0.5,
    color: '$text',
    borderColor: '$textSecondary',
    backgroundColor: '$boxBackground'
  }
});
