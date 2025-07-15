import * as React from 'react';
import {Animated, View, Dimensions} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RectButton} from 'react-native-gesture-handler';

import {SwipeableWithHint} from './swipeable-with-hint';

import styles from './swipeable.styles';

type Interpolation = Animated.AnimatedInterpolation<number | string>;

interface Props {
  enabled?: boolean;
  children: React.ReactNode;
  leftActionText?: string;
  rightActionText?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function SwipeableRow(props: Props) {
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

  const renderActions = (dragX: Interpolation, toLeft: boolean) => {
    const inputRange = toLeft ? leftRange : rightRange;
    const trans = dragX.interpolate({
      inputRange,
      outputRange: toLeft ? [0, 5, 10, 15, 22, 30, 45, 60] : [-60, -45, -30, -22, -15, -10, -5, 0],
      extrapolate: 'clamp',
    });
    const scale = dragX.interpolate({
      inputRange: inputRange,
      outputRange: toLeft ? [0.8, 0.85, 0.9, 0.95, 1.0, 1.1, 1.2, 1.25] : [1.25, 1.2, 1.1, 1.0, 0.95, 0.9, 0.85, 0.8],
      extrapolate: 'clamp',
    });
    const text = (toLeft ? props?.leftActionText : props?.rightActionText) || '';
    return (
      <RectButton style={[toLeft ? styles.leftAction : styles.rightAction]} onPress={close}>
        <Animated.Text
          style={[
            toLeft ? styles.leftActionText : styles.rightActionText,
            {transform: [{translateX: trans}, {scale}]},
          ]}
        >
          {text.split(' ').join('\n')}
        </Animated.Text>
      </RectButton>
    );
  };

  const renderLeftAction = props?.onSwipeLeft
    ? (_: Interpolation, dragX: Interpolation) => renderActions(dragX, true)
    : undefined;

  const renderRightAction = props?.onSwipeRight
    ? (_: Interpolation, dragX: Interpolation) => renderActions(dragX, false)
    : undefined;

  return (
    <Swipeable
      enabled={typeof props.enabled === 'boolean' ? props.enabled : true}
      containerStyle={styles.container}
      ref={swipeableRow}
      enableTrackpadTwoFingerGesture
      friction={1.5}
      leftThreshold={fullWidth * 0.2}
      rightThreshold={fullWidth * 0.2}
      animationOptions={{
        delay: 0,
        speed: 200,
        bounciness: 2,
      }}
      onSwipeableOpen={(direction: 'left' | 'right') => {
        if (direction === 'left') {
          props.onSwipeLeft?.();
        } else {
          props.onSwipeRight?.();
        }
        close();
      }}
      renderLeftActions={renderLeftAction}
      renderRightActions={renderRightAction}
    >
      <View style={styles.content}>{props.children}</View>
    </Swipeable>
  );
}

export const SwipeableRowWithHint = SwipeableWithHint(SwipeableRow);
