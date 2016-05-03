import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_FONT_GRAY, COLOR_FONT, COLOR_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  summaryInput: {
    margin: UNIT,
    padding: UNIT,
    color: COLOR_FONT,
    fontSize: 18,
    height: UNIT * 5
  },
  descriptionInput: {
    height: UNIT * 10,
    margin: UNIT,
    padding: UNIT,
    flex: 1,
    backgroundColor: '#FFF',
    color: COLOR_FONT,
    borderColor: 'black',
    fontSize: 14
  },
  disabledCreateButton: {
    color: COLOR_FONT_GRAY
  },
  separator: {
    height: 0.5,
    backgroundColor: COLOR_GRAY
  },
  attachesContainer: {
    margin: UNIT,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2
  },
  attachButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  attachButton: {
    paddingTop: UNIT,
    paddingBottom: UNIT,
    flexDirection: 'row'
  },
  attachIcon: {
    marginRight: UNIT,
    width: 16,
    height: 16
  },
  attachButtonText: {
    color: COLOR_PINK,
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
  }
});
