import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../../components/variables/variables';
import {HEADER_FONT_SIZE, mainText} from '../../components/common-styles/typography';
import {separator} from '../../components/common-styles/list';

const ATTACHING_IMAGE_ALPHA = '70';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  title: {
    paddingLeft: UNIT * 2,
    fontSize: HEADER_FONT_SIZE,
    color: '$text'
  },
  issueSummary: {
    marginTop: UNIT,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2
  },
  creatingIndicator: {
    paddingTop: 4,
    width: 30,
    height: 20
  },
  separator: {
    height: 1,
    ...separator,
    borderColor: '$separator'
  },
  attachesContainer: {
    marginTop: UNIT * 2,
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
  attachButtonText: {
    ...mainText,
    paddingLeft: UNIT * 2,
    color: '$link'
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
    width: UNIT * 2,
    height: UNIT * 2
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
    color: '$text',
    fontSize: UNIT * 2,
    flexShrink: 2,
  },
  selectProjectIcon: {
    alignSelf: 'flex-end',
    marginLeft: UNIT,
    width: UNIT * 2,
    height: UNIT * 2
  },
});
