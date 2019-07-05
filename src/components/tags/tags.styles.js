import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_GRAY,
} from '../../components/variables/variables';

export default StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginLeft: -UNIT / 4,
    marginRight: -UNIT / 4
  },
  tagColorField: {
    width: null, //Removes fixed width of usual color field
    paddingLeft: UNIT / 2,
    paddingRight: UNIT / 2,
    margin: UNIT / 4,
    borderWidth: 0.5,
    borderColor: COLOR_GRAY
  }
});
