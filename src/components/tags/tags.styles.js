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
    width: null, //Removes fixed width of usual color field
    paddingLeft: UNIT / 2,
    paddingRight: UNIT / 2,
    marginBottom: UNIT / 4,
    marginRight: UNIT,
  },
  tagMultiline: {
    marginBottom: UNIT,
  },
  tagNoColor: {
    borderWidth: 0.5,
    borderColor: '$textSecondary'
  }
});
