import EStyleSheet from 'react-native-extended-stylesheet';

import {headerTitle, mainText, UNIT} from 'components/common-styles';


export default EStyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '$background',
  },
  content: {
    flex: 1,
    paddingBottom: UNIT * 6,
  },
  images: {
    flexGrow: 1,
    paddingHorizontal: UNIT * 2,
  },
  filePreview: {
    width: '100%',
    minHeight: 50,
  },
  imagePreview: {
    marginTop: UNIT,
  },
  title: {...headerTitle, color: '$text'},
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UNIT,
    margin: UNIT,
  },
  buttonIcon: {
    minWidth: 20,
    marginRight: UNIT * 2,
    color: '$iconAccent',
  },
  buttonText: {...mainText, color: '$text'},
  visibilityButton: {
    marginVertical: UNIT,
    marginLeft: UNIT * 2,
  },
  link: {
    color: '$link',
  },
  disabled: {
    color: '$disabled',
  },
  thumbnail: {
    width: '100%',
    marginBottom: UNIT * 2,
  },
});
