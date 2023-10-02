import * as React from 'react';
import {Animated, View} from 'react-native';

import AnimatedInterpolation = Animated.AnimatedInterpolation;
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RectButton} from 'react-native-gesture-handler';

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

  const close = () => swipeableRow?.current?.close?.();
  const getTextPresentation = (text: string = '') => text.split(' ').join('\n');

  const renderActions = (dragX: Interpolation, isLeftAction: boolean) => {
    const trans = dragX.interpolate({
      inputRange: [-10, 5, 250, 251],
      outputRange: [-1, 1, 30, 1],
    });
    return (
      <RectButton style={isLeftAction ? styles.leftAction : styles.rightAction} onPress={close}>
        <Animated.Text
          style={[
            isLeftAction ? styles.leftActionText : styles.rightActionText,
            {transform: [{ translateX: trans }]},
          ]}
        >
          {getTextPresentation(isLeftAction  ? props?.leftActionText : props?.rightActionText)}
        </Animated.Text>
      </RectButton>
    );
  };

  const renderLeftAction = (
    props?.onSwipeLeft
      ? (progress: AnimatedInterpolation<number>, dragX: Interpolation) => renderActions(dragX, true)
      : undefined
  );
  const renderRightAction = (
    props?.onSwipeRight
      ? (progress: AnimatedInterpolation<number>, dragX: Interpolation) => renderActions(dragX, false)
      : undefined
  );

  return (
    <Swipeable
      enabled={typeof props.enabled === 'boolean' ? props.enabled : true}
      containerStyle={styles.container}
      ref={swipeableRow}
      overshootLeft={false}
      overshootRight={false}
      enableTrackpadTwoFingerGesture
      friction={2}
      leftThreshold={100}
      rightThreshold={100}
      overshootFriction={8}
      animationOptions={{
        delay: 0,
        speed: 140,
      }}
      onSwipeableOpen={(direction: 'left' | 'right', swipeable: Swipeable) => {
        swipeable.close();
        if (direction === 'left') {
          props?.onSwipeLeft?.();
        } else {
          props?.onSwipeRight?.();
        }
      }}
      renderLeftActions={renderLeftAction}
      renderRightActions={renderRightAction}
    >
      <View style={styles.content}>
        {props.children}
      </View>
    </Swipeable>
  );
}

