import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_FONT, COLOR_FONT_GRAY, COLOR_GRAY} from '../../components/variables/variables';

const ATTACHING_IMAGE_ALPHA = '70';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  issueSummary: {
    marginTop: UNIT,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2
  },
  disabledCreateButton: {
    color: COLOR_FONT_GRAY
  },
  creatingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20
  },
  separator: {
    height: 0.5,
    backgroundColor: COLOR_GRAY
  },
  attachesContainer: {
    marginTop: 0,
    marginBottom: UNIT,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2
  },
  imageActivityIndicator: {
    backgroundColor: `#CCCCCC${ATTACHING_IMAGE_ALPHA}`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: UNIT,
    bottom: 0
  },
  attachButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UNIT,
    marginRight: UNIT
  },
  attachButton: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    flexDirection: 'row'
  },
  attachIcon: {
    marginRight: UNIT * 1.5,
    width: 20,
    height: 20
  },
  attachButtonText: {
    color: COLOR_PINK,
    fontSize: 16,
    fontWeight: '200'
  },
  actionContainer: {
    flexDirection: 'row',
    margin: UNIT,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2
  },
  actionContent: {
    marginLeft: UNIT * 2,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionIcon: {
    width: 16,
    height: 16
  },
  selectProjectButton: {
    paddingTop: UNIT*2,
    paddingBottom: UNIT*2,
    marginLeft: UNIT*2,
    marginRight: UNIT*2,
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  selectProjectText: {
    color: COLOR_FONT,
    fontSize: 16
  },
  selectProjectIcon: {
    alignSelf: 'flex-end',
    width: 16,
    height: 16
  },
});
