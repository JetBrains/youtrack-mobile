import {Dimensions} from 'react-native';

import {isSplitView} from 'components/responsive/responsive-helper';
import {splitViewLeftSideBarWidth} from 'components/common-styles/split-view';
import {UNIT} from 'components/variables';

import type {ImageDimensions} from 'types/CustomFields';

export default function calculateAspectRatio(dimensions?: ImageDimensions): ImageDimensions {
  const maxWidth = Dimensions.get('window').width - UNIT * 2 - (isSplitView() ? splitViewLeftSideBarWidth : 0);
  const maxHeight = 300;

  if (!dimensions?.width || !dimensions?.height || dimensions?.width < 0 || dimensions?.height < 0) {
    return {
      width: maxWidth,
      height: maxHeight,
    };
  }

  const ratio = dimensions.width > maxWidth ? Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height) : 1;
  return {
    width: Math.round(dimensions.width * ratio),
    height: Math.round(dimensions.height * ratio),
  };
}
