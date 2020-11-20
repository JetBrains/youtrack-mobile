/* @flow */

import EStyleSheet from 'react-native-extended-stylesheet';

import {MAIN_FONT_SIZE, SECONDARY_FONT_SIZE} from '../../components/common-styles/typography';
import {rowFormStyles} from '../../components/common-styles/form';
import {UNIT} from '../../components/variables/variables';


export default EStyleSheet.create({
  feedbackContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    paddingHorizontal: UNIT,
    paddingBottom: UNIT * 5
  },
  feedbackForm: {
    flexGrow: 1,
    paddingHorizontal: UNIT
  },
  feedbackFormType: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: UNIT * 1.5
  },
  feedbackFormDescription: {
    flexGrow: 1,
    paddingBottom: UNIT * 3
  },
  feedbackFormText: {
    fontSize: MAIN_FONT_SIZE,
    color: '$text'
  },
  feedbackFormTextSup: {
    position: 'absolute',
    top: UNIT / 2,
    left: UNIT,
    fontSize: SECONDARY_FONT_SIZE - 2,
    color: '$icon'
  },
  feedbackFormTextMain: {
    marginBottom: -UNIT * 1.5
  },
  feedbackFormInput: {
    ...rowFormStyles.input,
    marginTop: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground'
  },
  feedbackFormInputDescription: {
    ...rowFormStyles.input,
    height: UNIT * 29,
    flexGrow: 1,
    marginTop: UNIT * 2,
    color: '$text',
    backgroundColor: '$boxBackground'
  },
  feedbackFormBottomIndent: {
    height: UNIT * 8
  }
});
