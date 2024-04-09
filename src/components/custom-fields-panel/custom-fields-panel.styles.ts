import EStyleSheet from 'react-native-extended-stylesheet';

import {headerTitlePresentation} from 'components/header/header.styles';
import {rowFormStyles} from 'components/common-styles/form';
import {UNIT} from 'components/variables';

const simpleValueInput = {...rowFormStyles.input, color: '$text'};

export default EStyleSheet.create({
  customFieldSimpleEditor: {
    flex: 1,
    padding: UNIT * 2,
  },
  editorViewContainer: {
    flex: 1,
    flexShrink: 1,
    backgroundColor: '$background',
  },
  simpleValueInput,
  savingFieldIndicator: {
    backgroundColor: '$linkLight',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  savingFieldTitle: headerTitlePresentation,
  link: {
    color: '$link',
  },
  placeholderText: {
    color: '$icon',
  },
});
