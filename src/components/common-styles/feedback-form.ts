import {elevation1} from './shadow';
import {MAIN_FONT_SIZE, mainText, SECONDARY_FONT_SIZE} from './typography';
import {rowFormStyles} from './form';
import {UNIT} from 'components/variables';
const feedbackFormStyles = {
  feedbackContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    paddingHorizontal: UNIT,
  },
  feedbackForm: {
    flexGrow: 1,
    paddingHorizontal: UNIT,
  },
  feedbackFormType: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: UNIT * 6.5,
  },
  feedbackFormDescription: {
    flexGrow: 1,
    paddingBottom: UNIT * 3,
  },
  feedbackFormText: {
    fontSize: MAIN_FONT_SIZE,
    color: '$text',
  },
  feedbackFormTextSup: {
    position: 'absolute',
    top: UNIT / 2,
    left: UNIT,
    fontSize: SECONDARY_FONT_SIZE - 2,
    color: '$textSecondary',
  },
  feedbackFormTextMain: {
    flexGrow: 1,
    marginBottom: -UNIT * 2,
  },
  feedbackFormTextError: {
    color: '$error',
  },
  feedbackInput: {
    ...rowFormStyles.input,
    position: 'absolute',
    top: UNIT,
    backgroundColor: 'transparent',
  },
  feedbackInputError: rowFormStyles.inputError,
  feedbackInputErrorHint: {
    margin: UNIT,
    fontSize: SECONDARY_FONT_SIZE - 2,
    color: '$error',
  },
  feedbackFormInput: {
    ...rowFormStyles.input,
    marginTop: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  feedbackFormInputMultiline: {
    minHeight: UNIT * 6,
    maxHeight: UNIT * 12,
    flexGrow: 1,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  feedbackFormInputMultilineWithLabel: {
    paddingTop: UNIT * 2.5,
  },
  feedbackFormBottomIndent: {
    height: UNIT * 14,
  },
  elevation1: elevation1,
  icon: {
    color: '$icon',
  },
  link: {
    color: '$link',
  },
  text: {
    ...mainText,
    color: '$text',
  },
};
export default feedbackFormStyles;
