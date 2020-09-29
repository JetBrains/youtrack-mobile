/* @flow */

import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from '../variables/variables';
import {headerTitle, mainText} from '../common-styles/typography';

export default EStyleSheet.create({
  container: {
    paddingBottom: UNIT * 2
  },
  content: {
    flex: 1,
    flexDirection: 'column'
  },
  image: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    ...headerTitle,
    fontWeight: '500'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UNIT,
    margin: UNIT
  },
  buttonIcon: {
    marginRight: UNIT * 2
  },
  buttonText: {
    ...mainText,
    color: '$text'
  },
  visibilityButton: {
    margin: UNIT * 3
  }
});
