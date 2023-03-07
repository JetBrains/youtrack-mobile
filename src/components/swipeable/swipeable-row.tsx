import * as React from 'react';
import {Text} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RectButton} from 'react-native-gesture-handler';


import styles from './swipeable.styles';

interface Props {
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

  return (
    <Swipeable
      containerStyle={styles.container}
      ref={swipeableRow}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={80}
      enableTrackpadTwoFingerGesture
      rightThreshold={80}
      overshootFriction={8}

      onSwipeableOpen={(direction: 'left' | 'right', swipeable: Swipeable) => {
        if (direction === 'left') {
          props.onSwipeLeft();
        } else {
          props.onSwipeRight();
        }
        swipeable.close();
      }}
      renderLeftActions={() => (
        <RectButton
          style={styles.leftAction}
          onPress={close}
        >
          <Text style={styles.leftActionText}>
            {getTextPresentation(props.leftActionText)}
          </Text>
        </RectButton>
      )}
      renderRightActions={() => (
        <RectButton
          style={styles.rightAction}
          onPress={close}
        >
          <Text style={styles.rightActionText}>
            {getTextPresentation(props.rightActionText)}
          </Text>
        </RectButton>
      )}>
      {props.children}
    </Swipeable>
  );
}

