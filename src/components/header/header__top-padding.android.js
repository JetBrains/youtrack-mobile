import {StatusBar, PixelRatio} from 'react-native';

const pixelRatio = PixelRatio.get();

export default function getTopPadding() {
  return StatusBar.currentHeight / pixelRatio;
}

export function onHeightChange() {}

