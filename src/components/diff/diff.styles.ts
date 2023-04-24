import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {SECONDARY_FONT_SIZE} from 'components/common-styles';
export default EStyleSheet.create({
  button: {
    flexDirection: 'row',
  },
  diffInsert: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
    backgroundColor: '#E6FFE6',
  },
  diffDelete: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
    backgroundColor: '#FFE6E6',
  },
  diffEqual: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$textSecondary',
  },
  title: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$icon',
  },
  toggle: {
    fontSize: SECONDARY_FONT_SIZE,
    color: '$link',
  },
  content: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
  },
  icon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
    color: '$link',
  },
});
