import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText, UNIT} from 'components/common-styles';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '$background',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    alignItems: 'flex-start',
    padding: UNIT * 3.6,
    zIndex: -1,
    backgroundColor: '$linkLight',
  },
  actionContainerRight: {
    top: 0,
    right: 0,
    bottom: 0,
    left: null,
    alignItems: 'flex-end',
  },
  actionText: {
    ...mainText,
    fontWeight: '600',
    color: '$text',
  },
  actionTextRight: {
    textAlign: 'right',
  },
});
