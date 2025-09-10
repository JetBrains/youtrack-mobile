import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {Animated, Dimensions, View} from 'react-native';

import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent as GestureEvent,
  PanGestureHandlerStateChangeEvent as StateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import {HapticFeedbackTypes, trigger} from 'react-native-haptic-feedback';

import SwipeableAction from './swipeable-action';

import styles from './swipeable.styles';

import {
  hapticConfig,
  PanGestureActiveOffsetX,
  PanGestureFailOffsetY,
  SWIPE_ANIMATION_CONFIG,
  SwipeDirection,
} from 'components/swipeable/index';

import type {SwipeAction} from 'components/swipeable/index';

const DEFAULT_THRESHOLD = 80;
const MAX_NO_ACTION_SWIPE = 160;
const getTranslationFriction = (translation: number): number => {
  return Math.sign(translation) * Math.min(Math.abs(translation) * 0.25, MAX_NO_ACTION_SWIPE * 0.4);
};

interface Props extends React.PropsWithChildren {
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  enabled?: boolean;
  threshold?: number;
  swipeToEdge?: boolean;
  syncUpdate?: boolean;
}

const Swipeable = ({
  children,
  leftAction,
  rightAction,
  enabled = true,
  threshold = DEFAULT_THRESHOLD,
  swipeToEdge = false,
  syncUpdate = false,
}: Props) => {
  const panRef = useRef<PanGestureHandler>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const actionScale = useRef(new Animated.Value(1)).current;
  const isActionTriggered = useRef(false);
  const activeAction = useRef<SwipeDirection | null>(null);

  const animateAction = useCallback(
    (toValue: number) => {
      Animated.spring(actionScale, {
        toValue,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }).start();
    },
    [actionScale],
  );

  useEffect(() => {
    return () => {
      translateX.resetAnimation();
    };
  }, [translateX]);

  const screenWidth = useMemo(() => Dimensions.get('window').width, []);

  const actionContainerWidth = useMemo((): string => {
    return !!leftAction && !!rightAction ? '50%' : '100%';
  }, [leftAction, rightAction]);

  const triggerHapticFeedback = useCallback(() => {
    trigger(HapticFeedbackTypes.impactMedium, hapticConfig);
  }, []);

  const animateSwipe = useCallback(
    async (direction: SwipeDirection) => {
      return new Promise<void>(resolve => {
        if (swipeToEdge) {
          const edgeValue = direction === SwipeDirection.LEFT ? screenWidth : -screenWidth;
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: edgeValue,
              ...SWIPE_ANIMATION_CONFIG.toEdge,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              ...SWIPE_ANIMATION_CONFIG.fromEdge,
            }),
          ]).start(() => resolve());
        } else {
          Animated.timing(translateX, {
            toValue: 0,
            ...SWIPE_ANIMATION_CONFIG.immediate,
          }).start(() => resolve());
        }
      });
    },
    [screenWidth, swipeToEdge, translateX],
  );

  const animateFallbackReturn = useCallback((smooth: boolean) => {
    const animate = smooth ? Animated.spring : Animated.timing;
    animate(translateX, {
      toValue: 0,
      ...(smooth ? SWIPE_ANIMATION_CONFIG.fallbackSmooth : SWIPE_ANIMATION_CONFIG.fallback),
    }).start();
  }, [translateX]);

  const resetTriggerActionIfBelowThreshold = useCallback(
    (translationX: number) => {
      if (Math.abs(translationX) < threshold) {
        if (isActionTriggered.current) {
          triggerHapticFeedback();
          animateAction(1);
        }
        isActionTriggered.current = false;
        activeAction.current = null;
      }
    },
    [animateAction, threshold, triggerHapticFeedback],
  );

  const hasAction = useCallback(
    (direction: SwipeDirection | null) => {
      return (
        (direction === SwipeDirection.LEFT && !!leftAction) || (direction === SwipeDirection.RIGHT && !!rightAction)
      );
    },
    [leftAction, rightAction],
  );

  const activateAction = useCallback(
    (direction: SwipeDirection | null) => {
      isActionTriggered.current = true;
      activeAction.current = direction;
      triggerHapticFeedback();
      animateAction(1.7);
    },
    [animateAction, triggerHapticFeedback],
  );

  const resetGestureState = useCallback(() => {
    isActionTriggered.current = false;
    activeAction.current = null;
  }, []);

  const getActiveDirection = (translationX: number): SwipeDirection | null => {
    let direction: SwipeDirection | null = null;
    if (translationX > 0) {
      direction = SwipeDirection.LEFT;
    } else if (translationX < 0) {
      direction = SwipeDirection.RIGHT;
    }
    return direction;
  };

  const gestureEventListener = useCallback(
    (event: GestureEvent) => {
      const translationX = event.nativeEvent.translationX;
      const direction = getActiveDirection(translationX);
      if (Math.abs(translationX) > threshold && !isActionTriggered.current && hasAction(direction)) {
        activateAction(direction);
      }
      resetTriggerActionIfBelowThreshold(translationX);
    },
    [threshold, hasAction, resetTriggerActionIfBelowThreshold, activateAction],
  );

  const onGestureEvent = useMemo(() => {
    return (event: GestureEvent) => {
      const translationX = event.nativeEvent.translationX;
      const direction = getActiveDirection(translationX);
      if (!hasAction(direction)) {
        translateX.setValue(getTranslationFriction(translationX));
      } else {
        translateX.setValue(translationX);
        gestureEventListener(event);
      }
    };
  }, [translateX, gestureEventListener, hasAction]);

  const onStateChange = useCallback(
    async (event: StateChangeEvent) => {
      const {state, translationX} = event.nativeEvent;

      if (state === State.END) {
        let activeDirection: SwipeDirection.LEFT | SwipeDirection.RIGHT | null = null;
        if (translationX > 0) {
          activeDirection = SwipeDirection.LEFT;
        } else if (translationX < 0) {
          activeDirection = SwipeDirection.RIGHT;
        }
        const actionTriggered = Math.abs(translationX) > threshold && isActionTriggered.current;

        if (actionTriggered && activeDirection) {
          const action = (activeDirection === SwipeDirection.LEFT ? leftAction : rightAction) ?? null;
          if (syncUpdate && action) {
            action.onSwipe();
          }
          await animateSwipe(activeDirection);
          if (!syncUpdate && action) {
            action.onSwipe();
          }
        } else {
          const actionDefined = hasAction(activeDirection);
          if (actionDefined && isActionTriggered.current) {
            triggerHapticFeedback();
          }
          animateFallbackReturn(!actionDefined);
        }
        resetGestureState();
      }
    },
    [
      threshold,
      resetGestureState,
      leftAction,
      rightAction,
      syncUpdate,
      animateSwipe,
      hasAction,
      animateFallbackReturn,
      triggerHapticFeedback,
    ],
  );

  if (!enabled) {
    return <View>{children}</View>;
  }

  return (
    <PanGestureHandler
      ref={panRef}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onStateChange}
      activeOffsetX={PanGestureActiveOffsetX}
      failOffsetY={PanGestureFailOffsetY}
    >
      <Animated.View style={styles.container}>
        {leftAction && (
          <SwipeableAction action={leftAction} isLeft={true} width={actionContainerWidth} scale={actionScale} />
        )}
        {rightAction && (
          <SwipeableAction action={rightAction} isLeft={false} width={actionContainerWidth} scale={actionScale} />
        )}
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{translateX}],
            },
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default React.memo(Swipeable);
