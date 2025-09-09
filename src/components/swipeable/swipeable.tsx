import * as React from 'react';

import {Animated, View} from 'react-native';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import {HapticFeedbackTypes, trigger} from 'react-native-haptic-feedback';
import {RectButton} from 'react-native-gesture-handler';

import {isIOSPlatform} from 'util/util';
import {SwipeableWithHint} from './swipeable-with-hint';
import {swipeDirection} from 'components/swipeable';
import {useSwipeable} from './use-swipeable';

import type {ActionColor, BaseSwipeableProps, SwipeDirection} from 'components/swipeable';
import type {Interpolation} from './use-swipeable';

import styles from './swipeable.styles';

const isIOS = isIOSPlatform();

interface SwipeableSingleDirectionRowProps extends BaseSwipeableProps, React.PropsWithChildren {
  direction?: SwipeDirection;
  actionText: string[];
  actionColor?: [ActionColor | null, ActionColor | null];
  onSwipe?: (isFirstSwipe: boolean) => void;
  onRightSwipe?: () => void;
  onLeftSwipe?: () => void;
}

function SwipeableRow({
  enabled,
  direction,
  actionText,
  actionColor,
  onSwipe,
  onRightSwipe,
  onLeftSwipe,
  children,
}: SwipeableSingleDirectionRowProps) {
  const swipeableRow = React.useRef<Swipeable | null>(null);
  const {getAnimationStyles, fullWidth} = useSwipeable();
  const threshold = fullWidth * 0.2;

  const [text0 = '', text1 = ''] = actionText;
  const [isFirstSwipe, setIsFirstSwipe] = React.useState(true);
  const [label, setLabel] = React.useState('');

  React.useEffect(() => {
    setLabel(actionText[0] ?? '');
    setIsFirstSwipe(true);
  }, [actionText]);

  const close = () => swipeableRow?.current?.close?.();

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

  return (
    <Swipeable
      enabled={typeof enabled === 'boolean' ? enabled : true}
      useNativeAnimations={true}
      containerStyle={styles.container}
      ref={swipeableRow}
      enableTrackpadTwoFingerGesture
      friction={isIOS ? 0.5 : 0.6}
      leftThreshold={threshold}
      rightThreshold={threshold}
      animationOptions={{
        delay: 0,
        speed: 1000,
        bounciness: 0,
      }}
      overshootLeft={false}
      overshootRight={false}
      shouldCancelWhenOutside={true}
      hitSlop={{left: -10, right: -10}}
      onSwipeableWillOpen={() => {
        trigger(HapticFeedbackTypes.impactMedium, {enableVibrateFallback: true, ignoreAndroidSystemSettings: true});
      }}
      onSwipeableOpen={(d: SwipeDirection) => {
        if (!direction && onRightSwipe && onLeftSwipe) {
          if (d === swipeDirection.left) {
            onLeftSwipe();
          } else {
            onRightSwipe();
          }
        } else if (direction && onSwipe && direction === d) {
          onSwipe(isFirstSwipe);
          setIsFirstSwipe(!isFirstSwipe);
          setLabel(isFirstSwipe ? text1 : text0);
        }
        close();
      }}
      renderLeftActions={
        direction === swipeDirection.left || onLeftSwipe
          ? (_: Interpolation, dragX: Interpolation) =>
              renderActions(dragX, true, direction ? label : text0, actionColor?.[0] ?? null)
          : undefined
      }
      renderRightActions={
        direction === swipeDirection.right || onRightSwipe
          ? (_: Interpolation, dragX: Interpolation) =>
              renderActions(dragX, false, direction ? label : text1, actionColor?.[1] ?? null)
          : undefined
      }
    >
      <View style={styles.content}>{children}</View>
    </Swipeable>
  );
}

export default SwipeableRow;
export const SwipeableRowWithHint = SwipeableWithHint(SwipeableRow);
