import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';
import {MAIN_FONT_SIZE} from './typography';

export const containerPadding = UNIT * 4;

export const formStyles = EStyleSheet.create({
  scrollContainer: {
    flexGrow: 1
  },
  container: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingLeft: containerPadding,
    paddingRight: containerPadding,
    backgroundColor: '$background'
  },
  input: {
    width: '100%',
    padding: UNIT * 1.5,
    paddingLeft: UNIT,
    paddingRight: UNIT,
    borderRadius: UNIT,
    backgroundColor: '$boxBackground',
    color: '$text',
    fontSize: MAIN_FONT_SIZE
  },
  button: {
    width: '100%',
    padding: UNIT * 1.5,
    alignItems: 'center',
    borderRadius: UNIT,
    backgroundColor: '$link',
  },
  buttonDisabled: {
    backgroundColor: '$textSecondary'
  },
  buttonText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: MAIN_FONT_SIZE,
    color: '$background'
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center'
  },
  hintText: {
    textAlign: 'center',
    color: '$textSecondary',
    fontSize: 12
  },
  errorText: {
    color: 'red'
  },
  link: {
    color: '$link'
  }
});
