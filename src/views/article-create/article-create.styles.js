import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../../components/common-styles/shadow';
import {UNIT} from '../../components/variables/variables';
import {mainText} from '../../components/common-styles/typography';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  header: elevation1,
  content: {
    flex: 1,
    paddingHorizontal: UNIT * 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: UNIT * 2.5,
    marginBottom: UNIT * 1.5
  },
  attachments: {
    marginTop: UNIT * 3,
    paddingHorizontal: UNIT * 2
  },
  projectContainer: {
    paddingLeft: UNIT,
    justifyContent: 'center',
  },
  projectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: UNIT
  },
  projectSelectorText: {
    ...mainText,
    marginRight: UNIT / 2,
    color: '$link'
  }
});
