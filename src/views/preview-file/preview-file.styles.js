/* @flow */

import EStyleSheet from 'react-native-extended-stylesheet';

import {headerMinHeight} from '../../components/header/header.styles';
import {title} from '../../components/common-styles/issue';
import {UNIT} from '../../components/variables/variables';

export default (EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$background',
  },

  loader: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    color: '$link',
  },

  removeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    left: UNIT * 3,
  },

  closeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },

  removeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    opacity: 0.4,
  },
  link: {
    color: '$link',
  },
  fullScreen: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  error: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -headerMinHeight * 2,
  },
  errorTitle: {
    marginBottom: UNIT * 1.5,
    ...title,
    color: '$text',
  },
}): any);
