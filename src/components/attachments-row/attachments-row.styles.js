import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';

export default EStyleSheet.create({
  attachesScroll: {
    paddingLeft: UNIT * 2,
    marginLeft: -UNIT * 2,
    marginRight: -UNIT * 2,
  },
  attachmentImage: {
    marginRight: UNIT,
    borderWidth: 1,
    borderColor: '$separator',
    borderRadius: UNIT / 2,
    width: UNIT * 12,
    height: UNIT * 8,
    overflow: 'hidden',
  },
  attachmentFile: {
    marginRight: UNIT * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentFileText: {
    fontSize: 10,
    color: '$text',
  },
  attachmentVideo: {
    backgroundColor: '$blueBackground',
  },
  attachmentType: {
    position: 'absolute',
    top: UNIT,
    left: UNIT,
  },
  attachmentText: {
    borderRadius: 3,
    paddingVertical: 1,
    paddingHorizontal: UNIT / 4,
    backgroundColor: '$blueColor',
    textTransform: 'uppercase',
    color: '$textButton',
    fontSize: 12,
    fontWeight: '500',
  },
  attachmentName: {
    flexGrow: 1,
    padding: UNIT,
    justifyContent: 'flex-end',
  },
  imageActivityIndicator: {
    backgroundColor: '$mask',
    position: 'absolute',
    top: 0,
    left: 0,
    right: UNIT,
    bottom: 0,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: UNIT,
    padding: UNIT / 2,
  },
  removingAttach: {
    opacity: 0.3,
  },
});
