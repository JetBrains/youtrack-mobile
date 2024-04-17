import EStyleSheet from 'react-native-extended-stylesheet';

import {StyleSheet} from 'react-native';

import {headerMinHeight} from 'components/header/header.styles';
import {title} from 'components/common-styles/issue';
import {UNIT} from 'components/variables';

export default EStyleSheet.create({
  container: {
    minWidth: '100%',
    minHeight: '97%',
    width: '100%',
    justifyContent: 'center',
  },
  header: {
    marginTop: UNIT,
    marginBottom: -headerMinHeight,
    backgroundColor: 'transparent',
  },
  preview: {
    position: 'relative',
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    height: null,
    maxWidth: '100%',
    maxHeight: '100%',
    marginTop: UNIT * 6,
  },
  loader: {...StyleSheet.absoluteFillObject, color: '$link'},
  removeButton: {
    position: 'absolute',
    bottom: UNIT * 3,
    left: UNIT * 3,
  },
  closeIcon: {
    paddingVertical: UNIT / 2,
    paddingHorizontal: UNIT,
  },
  link: {
    color: '$link',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: headerMinHeight,
  },
  video: {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
  },
  error: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -headerMinHeight * 2,
  },
  errorTitle: {
    marginBottom: UNIT * 1.5,
    ...title,
    color: '$background',
  },
});
