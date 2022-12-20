import {Dimensions} from 'react-native';
import {isSplitView} from '../responsive/responsive-helper';
import {splitViewLeftSideBarWidth} from '../common-styles/split-view';
import {UNIT} from '../variables/variables';
import type {ImageDimensions} from 'flow/CustomFields';
export default function calculateAspectRatio(
  dimensions: ImageDimensions = {},
): ImageDimensions {
  const maxWidth =
    Dimensions.get('window').width -
    UNIT * 10 -
    (isSplitView() ? splitViewLeftSideBarWidth : 0);
  const maxHeight = 300;

  if (
    !dimensions.width ||
    !dimensions.height ||
    dimensions.width < 0 ||
    dimensions.height < 0
  ) {
    return {
      width: maxWidth,
      height: maxHeight,
    };
  }

  const ratio =
    dimensions.width > maxWidth
      ? Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height)
      : 1;
  return {
    width: Math.round(dimensions.width * ratio),
    height: Math.round(dimensions.height * ratio),
  };
}