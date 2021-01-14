import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../../components/variables/variables';
import {headerTitle} from '../../components/common-styles/typography';
import {separator} from '../../components/common-styles/list';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  content: {
    paddingLeft: UNIT
  },
  title: {
    paddingLeft: UNIT * 2,
    ...headerTitle,
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
    marginTop: UNIT * 2,
    ...separator,
    borderColor: '$separator'
  },
  additionalData: {
    marginTop: UNIT * 3,
    marginHorizontal: UNIT * 2
  },
  imageActivityIndicator: {
    backgroundColor: '$mask',
    position: 'absolute',
    top: 0,
    left: 0,
    right: UNIT,
    bottom: 0
  },
  selectProjectButton: {
    paddingTop: UNIT * 2,
    paddingBottom: UNIT * 2,
    marginLeft: UNIT * 2,
    marginRight: UNIT * 2,
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
  visibility: {
    marginTop: UNIT * 3,
    marginLeft: UNIT * 2,
    marginBottom: UNIT * 2,
  }
});
