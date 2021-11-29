import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  box: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: UNIT * 7,
    backgroundColor: '$dimBackground',
  },
  content: {
    flex: 1,
    maxWidth: 704,
    marginHorizontal: 40,
    backgroundColor: '$background',
    borderRadius: UNIT * 3,
  },
  children: {
    flex: 1,
    maxWidth: 704,
    overflow: 'hidden',
    borderRadius: UNIT * 3,
    paddingHorizontal: UNIT * 2.5,
  },
});
