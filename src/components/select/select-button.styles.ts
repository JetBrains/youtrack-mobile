import EStyleSheet from 'react-native-extended-stylesheet';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE} from '../common-styles/typography';
import {UNIT} from '../variables/variables';
import {rowFormStyles} from '../common-styles/form';
export const selectButtonMinHeight: number = UNIT * 5.5;
export default EStyleSheet.create({
  button: {
    ...rowFormStyles.input,
    width: null,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: selectButtonMinHeight,
    paddingHorizontal: UNIT * 2,
  },
  buttonText: {
    fontSize: MAIN_FONT_SIZE,
    color: '$text',
  },
  buttonTextMain: {
    marginBottom: -UNIT * 2,
  },
  buttonTextSub: {
    position: 'absolute',
    top: UNIT / 2,
    left: UNIT * 2,
    right: UNIT * 3,
    fontSize: SECONDARY_FONT_SIZE - 2,
    color: '$icon',
  },
  buttonIcon: {
    fontSize: MAIN_FONT_SIZE,
    color: '$icon',
  },
});
