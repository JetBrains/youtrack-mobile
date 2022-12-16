import EStyleSheet from 'react-native-extended-stylesheet';

import feedbackFormStyles from 'components/common-styles/feedback-form';


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
});
