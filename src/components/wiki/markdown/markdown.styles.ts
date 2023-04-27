import EStyleSheet from 'react-native-extended-stylesheet';

import {issueIdResolved} from 'components/common-styles/issue';


export default EStyleSheet.create({
  link: {
    color: '$link',
  },
  resolved: {
    color: '$textSecondary',
    ...issueIdResolved,
  },
  video: {
    width: 315,
    height: 240,
    alignSelf: 'stretch',
  },
});
