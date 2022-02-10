/* @flow */

import {Dimensions} from 'react-native';

import {isTablet} from 'util/util';


const tabletSplitViewFactor: number = 0.66;

const isSplitView = (): boolean => {
  const windowWidth: number = Dimensions.get('window').width;
  const screenWidth: number = Dimensions.get('screen').width;
  return isTablet && (windowWidth >= screenWidth * tabletSplitViewFactor);
};

export {
  isSplitView,
};
