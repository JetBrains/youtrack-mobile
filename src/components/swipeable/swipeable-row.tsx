import * as React from 'react';
import {Animated} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';
// import Swipeable from './sw';
import {RectButton} from 'react-native-gesture-handler';


import styles from './swipeable.styles';

interface Props {
  enabled?: boolean;
  children: React.ReactNode;
  leftActionText: string;
  rightActionText: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}


export default function SwipeableRow(props: Props) {
  const swipeableRow = React.useRef<Swipeable | null>(null);

  const close = () => swipeableRow?.current?.close?.();
  const getTextPresentation = (text: string) => text.split(' ').join('\n');

  const renderActions = (dragX: Animated.AnimatedInterpolation<number | string>, isLeftAction: boolean) => {
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
          {getTextPresentation(isLeftAction  ? props.leftActionText : props.rightActionText)}
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      enabled={typeof props.enabled === 'boolean' ? props.enabled : true}
      containerStyle={styles.container}
      ref={swipeableRow}
      overshootLeft={false}
      overshootRight={false}
      enableTrackpadTwoFingerGesture
      friction={2}
      leftThreshold={20}
      rightThreshold={20}
      overshootFriction={8}
      animationOptions={{
        delay: 0,
        speed: 140,
      }}
      onSwipeableOpen={(direction: 'left' | 'right', swipeable: Swipeable) => {
        swipeable.close();
        if (direction === 'left') {
          props.onSwipeLeft();
        } else {
          props.onSwipeRight();
        }
      }}
      renderLeftActions={(progress, dragX) => renderActions(dragX, true)}
      renderRightActions={(progress, dragX) => renderActions(dragX, false)}
    >
      {props.children}
    </Swipeable>
  );
}

