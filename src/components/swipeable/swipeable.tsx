import * as React from 'react';

import {View} from 'react-native';
import {HapticFeedbackTypes, trigger} from 'react-native-haptic-feedback';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import {SwipeableWithHint} from './swipeable-with-hint';
import {swipeDirection} from 'components/swipeable';
import {useSwipeable} from './use-swipeable';

import styles from './swipeable.styles';

import type {ActionColor, BaseSwipeableProps, SwipeDirection} from 'components/swipeable';
import type {Interpolation} from './use-swipeable';

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
  const {swipeableRow, close, renderActions, props} = useSwipeable();
  const [text0 = '', text1 = ''] = actionText;
  const [isFirstSwipe, setIsFirstSwipe] = React.useState(true);
  const [label, setLabel] = React.useState('');

  React.useEffect(() => {
    setLabel(actionText[0] ?? '');
    setIsFirstSwipe(true);
  }, [actionText]);

  return (
    <Swipeable
      enabled={typeof enabled === 'boolean' ? enabled : true}
      containerStyle={styles.container}
      ref={swipeableRow}
      enableTrackpadTwoFingerGesture
      friction={props.friction}
      leftThreshold={props.leftThreshold}
      rightThreshold={props.rightThreshold}
      animationOptions={props.animationOptions}
      onSwipeableWillOpen={() => {
        trigger(HapticFeedbackTypes.impactMedium);
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
