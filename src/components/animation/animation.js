/* @flow */

import {LayoutAnimation} from 'react-native';

function layoutAnimation() {
  if (!layoutAnimation.layoutAnimationActive) {//https://github.com/facebook/react-native/issues/13984
    layoutAnimation.layoutAnimationActive = true;
    const defaultEffect = LayoutAnimation.Presets.easeInEaseOut;
    defaultEffect && LayoutAnimation.configureNext(
      defaultEffect,
      () => { layoutAnimation.layoutAnimationActive = null; }
    );
  }
}

export default {
  layoutAnimation
};
