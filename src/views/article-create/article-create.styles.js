import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from '../../components/common-styles/shadow';
import {separatorTopBorder} from '../../components/common-styles/list';
import {UNIT} from '../../components/variables/variables';

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
  form: {
    marginTop: UNIT * 2,
    paddingTop: UNIT,
    ...separatorTopBorder,
    borderColor: '$separator'
  },
  projectSelector: {
    flexDirection: 'row',
    marginVertical: UNIT * 2,
    alignItems: 'center',
  },
  projectSelectorText: {
    marginRight: UNIT / 2,
    color: '$link'
  }
});
