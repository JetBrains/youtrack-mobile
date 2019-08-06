import {StyleSheet} from 'react-native';
import {
  UNIT,
  COLOR_GRAY,
  COLOR_FONT_ON_BLACK,
  COLOR_ICON_MEDIUM_GREY
} from '../../components/variables/variables';

export default StyleSheet.create({
  modal: {
    paddingTop: UNIT * 2
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  tagsContainerAll: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  tag: {
    width: null, //Removes fixed width of usual color field
    paddingLeft: UNIT / 2,
    paddingRight: UNIT / 2,
    margin: UNIT / 4
  },
  tagMultiline: {
    marginBottom: UNIT,
  },
  tagNoColor: {
    borderWidth: 0.5,
    borderColor: COLOR_GRAY
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
  }});
