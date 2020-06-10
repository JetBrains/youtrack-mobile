import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_GRAY
} from '../variables/variables';

export default StyleSheet.create({
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
    borderColor: COLOR_GRAY
  }
});
