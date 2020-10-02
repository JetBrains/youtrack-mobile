import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  attachesScroll: {
    paddingLeft: UNIT * 2,
    marginLeft: -UNIT * 2,
    marginRight: -UNIT * 2
  },
  attachmentImage: {
    marginRight: UNIT,
    borderWidth: 1,
    borderColor: '$boxBackground',
    borderRadius: 3,
    width: 120,
    height: UNIT * 8,
    overflow: 'hidden'
  },
  attachmentFile: {
    marginRight: UNIT * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageActivityIndicator: {
    backgroundColor: '$mask',
    position: 'absolute',
    top: 0,
    left: 0,
    right: UNIT,
    bottom: 0
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: UNIT,
    padding: UNIT
  },
  removingAttach: {
    opacity: .3
  }
});
