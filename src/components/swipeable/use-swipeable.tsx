import * as React from 'react';

import {Animated, Dimensions} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RectButton} from 'react-native-gesture-handler';

import styles from './swipeable.styles';

export type Interpolation = Animated.AnimatedInterpolation<number | string>;
import type {ActionColor} from 'components/swipeable/index';
import type {SwipeableProps} from 'react-native-gesture-handler/Swipeable';

export interface SwipeAction {
  actionText?: string;
  onSwipe?: () => void;
}

export interface SwipeableData {
  swipeableRow: React.RefObject<Swipeable>;
  fullWidth: number;
  leftRange: number[];
  rightRange: number[];
  close: () => void;
  getAnimationStyles: (
    dragX: Interpolation,
    toLeft: boolean
  ) => {
    transform: {
      translateX?: Interpolation;
      scale?: Interpolation;
    }[];
  };
  renderActions: (
    dragX: Interpolation,
    toLeft: boolean,
    text: string,
    actionColor: ActionColor | null
  ) => React.ReactNode;
  props: SwipeableProps;
}

export function useSwipeable(): SwipeableData {
  const swipeableRow = React.useRef<Swipeable | null>(null);
  const getFullWidth = () => Dimensions.get('window').width;
  const [fullWidth, setFullWidth] = React.useState(getFullWidth());

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => setFullWidth(getFullWidth()));
    return () => subscription?.remove();
  }, []);

  const close = () => swipeableRow?.current?.close?.();

  const leftRange = React.useMemo(
    () => [
      0,
      fullWidth * 0.1,
      fullWidth * 0.2,
      fullWidth * 0.3,
      fullWidth * 0.4,
      fullWidth * 0.5,
      fullWidth * 0.75,
      fullWidth,
    ],
    [fullWidth]
  );

  const rightRange = React.useMemo(
    () => [
      -fullWidth,
      -fullWidth * 0.75,
      -fullWidth * 0.5,
      -fullWidth * 0.4,
      -fullWidth * 0.3,
      -fullWidth * 0.2,
      -fullWidth * 0.1,
      0,
    ],
    [fullWidth]
  );

  const getAnimationStyles = (dragX: Interpolation, toLeft: boolean) => {
    const inputRange = toLeft ? [0, fullWidth - 300] : [-fullWidth - 300, 0];

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

  const renderActions = (dragX: Interpolation, toLeft: boolean, text: string, actionColor?: ActionColor | null) => {
    const animationStyles = getAnimationStyles(dragX, toLeft);
    const actionStyle = toLeft ? styles.leftAction : styles.rightAction;
    const textStyle = toLeft ? styles.leftActionText : styles.rightActionText;
    return (
      <RectButton
        style={[actionStyle, actionColor?.backgroundColor ? {backgroundColor: actionColor.backgroundColor} : null]}
        onPress={close}
      >
        <Animated.Text style={[textStyle, animationStyles, actionColor?.color ? {color: actionColor.color} : null]}>
          {text.split(' ').join('\n')}
        </Animated.Text>
      </RectButton>
    );
  };

  return {
    swipeableRow,
    fullWidth,
    leftRange,
    rightRange,
    close,
    getAnimationStyles,
    renderActions,
    props: {
      friction: 0.8,
      leftThreshold: fullWidth * 0.15,
      rightThreshold: fullWidth * 0.15,
      overshootLeft: false,
      overshootRight: false,
      dragOffsetFromLeftEdge: 0,
      dragOffsetFromRightEdge: 0,
      useNativeAnimations: true,
      animationOptions: {
        delay: 0,
        speed: 200,
        bounciness: 4,
      },
    },
  };
}
