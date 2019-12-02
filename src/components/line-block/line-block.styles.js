import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_FONT_ON_BLACK,
  COLOR_ICON_MEDIUM_GREY, COLOR_MEDIUM_GRAY
} from '../variables/variables';

export default StyleSheet.create({
  containerInline: {
    marginTop: UNIT,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    marginRight: -UNIT * 2,
    marginTop: UNIT * 2,
    paddingTop: UNIT,
    paddingBottom: UNIT,
    borderColor: COLOR_MEDIUM_GRAY,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  modal: {
    paddingTop: UNIT * 2
  },
  closeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    left: UNIT * 3
  },
  removeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    right: UNIT * 3
  },
  closeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
  showMore: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR_FONT_ON_BLACK
  },
  showMoreIcon: {
    height: 14,
    resizeMode: 'contain',
    tintColor: COLOR_ICON_MEDIUM_GREY
  },
  arrowIcon: {
    lineHeight: 22
  }
});
