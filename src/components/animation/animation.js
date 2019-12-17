/* @flow */

import {LayoutAnimation} from 'react-native';

const defaultConfig = LayoutAnimation.Presets.easeInEaseOut;

function layoutAnimation(config?: Object) {
  if (!layoutAnimation.layoutAnimationActive) {//https://github.com/facebook/react-native/issues/13984
    layoutAnimation.layoutAnimationActive = true;
    LayoutAnimation.configureNext(
      config || defaultConfig,
      () => { layoutAnimation.layoutAnimationActive = null; }
    );
  }
}

export default {
  layoutAnimation,
  LayoutAnimation
};
