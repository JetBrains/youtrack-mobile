import EStyleSheet from 'react-native-extended-stylesheet';

import {mainText, UNIT} from 'components/common-styles';


export default EStyleSheet.create({
  tags: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tagsMultiline: {
    flexWrap: 'wrap',
  },
  tag: {
    marginBottom: UNIT / 4,
    marginRight: UNIT,
  },
  tagMultiline: {
    marginBottom: UNIT,
  },
  tagNoColor: {
    borderWidth: 0.5,
    color: '$text',
    borderColor: '$textSecondary',
    backgroundColor: '$boxBackground',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: UNIT * 1.5,
  },
  buttonText: {...mainText, marginLeft: UNIT * 1.8, color: '$link'},
  buttonTextDisabled: {
    color: '$icon',
  },
  secondaryText: {
    color: '$textSecondary',
  },
  tagIcon: {
    marginLeft: 3,
  },
  tagSelectItem: {
    paddingHorizontal: UNIT / 2,
    paddingVertical: UNIT / 4,
  },
});
