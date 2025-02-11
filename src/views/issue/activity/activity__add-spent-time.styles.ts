import EStyleSheet from 'react-native-extended-stylesheet';
import feedbackFormStyles from 'components/common-styles/feedback-form';
import {UNIT} from 'components/common-styles';

export default EStyleSheet.create({
  ...feedbackFormStyles,
  container: {
    flex: 1,
  },
  link: {
    color: '$link',
  },
  disabled: {
    color: '$disabled',
  },
  icon: {
    color: '$icon',
  },
  commentInput: {
    marginTop: UNIT * 2,
    padding: UNIT,
    borderRadius: UNIT,
  },
  placeholderText: {
    color: '$textSecondary',
  },
});
