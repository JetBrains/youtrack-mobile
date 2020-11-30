import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText} from '../common-styles/typography';
import {separatorBorder} from '../common-styles/list';
import {UNIT} from '../variables/variables';
import {elevation1} from '../common-styles/shadow';
import {formStyles} from '../common-styles/form';


export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background'
  },
  featuresList: {
    paddingHorizontal: UNIT * 2
  },
  featuresListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: UNIT * 2,
    ...separatorBorder,
    borderColor: '$separator'
  },
  featuresListItemText: {
    flexGrow: 1,
    ...mainText,
    color: '$text',
  },
  closeButton: {
    ...formStyles.button
  },
  elevation1: elevation1,
  link: {
    color: '$link'
  }
});
