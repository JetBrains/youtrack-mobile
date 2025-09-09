import * as React from 'react';

import {Animated, Dimensions} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';

export type Interpolation = Animated.AnimatedInterpolation<number | string>;

export interface SwipeAction {
  actionText?: string;
  onSwipe?: () => void;
}

export interface SwipeableData {
  swipeableRow: React.RefObject<Swipeable>;
  fullWidth: number;
  getAnimationStyles: (
    dragX: Interpolation,
    toLeft: boolean,
  ) => {
    transform: {
      translateX?: Interpolation;
      scale?: Interpolation;
    }[];
  };
}

export function useSwipeable(): SwipeableData {
  const swipeableRow = React.useRef<Swipeable | null>(null);
  const getFullWidth = () => Dimensions.get('window').width;
  const [fullWidth, setFullWidth] = React.useState(getFullWidth());

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => setFullWidth(getFullWidth()));
    return () => subscription?.remove();
  }, []);

  const getAnimationStyles = (dragX: Interpolation, toLeft: boolean) => {
    const inputRange = toLeft ? [0, fullWidth] : [-fullWidth, 0];

    const trans = dragX.interpolate({
      inputRange,
      outputRange: toLeft ? [-5, 20] : [-30, 0],
      extrapolate: 'clamp',
    });

    // Gentle scale for less jittery feel vs. aggressive 0.8–1.25
    const scale = dragX.interpolate({
      inputRange,
      outputRange: toLeft ? [0.92, 1.08] : [1.08, 0.92],
      extrapolate: 'clamp',
    });
    return {transform: [{translateX: trans}, {scale}]};
  };

  return {
    swipeableRow,
    fullWidth,
    getAnimationStyles,
  };
}
