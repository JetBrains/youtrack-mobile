import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_GRAY
} from '../../components/variables/variables';

export default StyleSheet.create({
  modal: {
    paddingTop: UNIT * 2
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  tagsContainerAll: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  tag: {
    width: null, //Removes fixed width of usual color field
    paddingLeft: UNIT / 2,
    paddingRight: UNIT / 2,
    margin: UNIT / 4
  },
  tagMultiline: {
    marginBottom: UNIT,
  },
  tagNoColor: {
    borderWidth: 0.5,
    borderColor: COLOR_GRAY
  }
});
