import {StyleSheet} from 'react-native';
import {UNIT} from '../../components/variables/variables';
import {secondaryText} from '../../components/common-styles/issue';

export default StyleSheet.create({
  button: {
    marginLeft: UNIT * 0.75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  counter: {
    marginRight: UNIT,
    ...secondaryText
  }
});
