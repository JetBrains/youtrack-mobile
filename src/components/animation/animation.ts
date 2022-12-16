/* @flow */

import {LayoutAnimation} from 'react-native';

const defaultConfig = {
  duration: 350,
  create:
    {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  update:
    {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
};

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
  LayoutAnimation,
};
