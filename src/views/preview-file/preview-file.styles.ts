import EStyleSheet from 'react-native-extended-stylesheet';
import {headerMinHeight} from 'components/header/header.styles';
import {StyleSheet} from 'react-native';
import {title} from 'components/common-styles/issue';
import {UNIT} from 'components/variables/variables';
export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: 'transparent',
  },
  preview: {
    flex: 1,
    position: 'relative',
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    height: null,
    maxWidth: '100%',
    maxHeight: '100%',
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
  fullScreen: {
    // ...StyleSheet.absoluteFillObject,
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
}) as any;
