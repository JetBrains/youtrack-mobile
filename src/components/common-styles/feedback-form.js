/* @flow */

import {elevation1} from './shadow';
import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE} from './typography';
import {rowFormStyles} from './form';
import {UNIT} from '../variables/variables';


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
    color: '$icon',
  },
  feedbackFormTextMain: {
    marginBottom: -UNIT,
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
  feedbackFormInputDescription: {
    ...rowFormStyles.input,
    minHeight: UNIT * 12,
    flexGrow: 1,
    marginTop: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground',
  },
  feedbackFormBottomIndent: {
    height: UNIT * 14,
  },
  elevation1: elevation1,
};

export default feedbackFormStyles;
