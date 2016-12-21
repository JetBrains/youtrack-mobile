import {StyleSheet} from 'react-native';
import {UNIT} from '../../components/variables/variables';

const ATTACHING_IMAGE_ALPHA = '70';

export default StyleSheet.create({
  attachesScroll: {
    marginTop: UNIT * 2,
    paddingLeft: UNIT * 2,
    marginLeft: -UNIT * 2,
    marginRight: -UNIT * 2
  },
  attachmentImage: {
    marginRight: UNIT,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 3,
    width: 120,
    height: UNIT * 8,
    resizeMode: 'cover'
  },
  attachmentFile: {
    marginRight: UNIT * 2,
    width: 120,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageActivityIndicator: {
    backgroundColor: `#CCCCCC${ATTACHING_IMAGE_ALPHA}`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: UNIT,
    bottom: 0
  },
});
