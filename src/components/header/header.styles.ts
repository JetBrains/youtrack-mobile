import EStyleSheet from 'react-native-extended-stylesheet';

import {elevation1} from 'components/common-styles';
import {headerTitle} from 'components/common-styles/typography';
import {UNIT} from 'components/variables';

const minButtonWidth: number = UNIT * 5;

export const headerMinHeight = UNIT * 8;

export const headerTitlePresentation = {
  ...headerTitle,
  marginLeft: UNIT,
  color: '$text',
};

export const baseHeaderStyles = {
  header: {
    position: 'relative',
    zIndex: 1,
    paddingHorizontal: UNIT,
    flex: 0,
    minHeight: headerMinHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '$background',
  },
  headerShadow: elevation1,
  headerTitle: headerTitlePresentation,
  headerButtonLeft: {
    minWidth: minButtonWidth,
    justifyContent: 'flex-start',
  },
  headerButtonRight: {
    minWidth: minButtonWidth,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  headerButtonText: {
    color: '$link',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
    flexShrink: 1,
    padding: 0,
  },
};

export default EStyleSheet.create(baseHeaderStyles);
