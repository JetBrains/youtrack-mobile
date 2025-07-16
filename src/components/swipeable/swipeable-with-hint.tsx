import * as React from 'react';

import {Animated, Easing, View} from 'react-native';

import {swipeDirection} from 'components/swipeable/index';

import styles from './swipeable.styles';

import type {SwipeDirection} from 'components/swipeable/index';

export interface WithHintProps {
  showHint?: boolean;
  hintDirection: SwipeDirection;
  hintDistance?: number;
  onAfterHintShow?: () => void;
}

const config = {
  easing: Easing.quad,
  useNativeDriver: true,
};

export function SwipeableWithHint<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithHintProps> {
  return function WithSwipeHint(props: P & WithHintProps) {
    const {hintDistance = 60, hintDirection, onAfterHintShow = () => {}, ...restProps} = props;
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    const showHintAnimation = React.useCallback(() => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        ...config,
        toValue: hintDirection === swipeDirection.left ? hintDistance : -hintDistance,
      }).start(() => {
        Animated.timing(animatedValue, {...config, duration: 100, toValue: 0}).start(onAfterHintShow);
      });
    }, [animatedValue, hintDirection, hintDistance, onAfterHintShow]);

    React.useEffect(() => {
      if (props.showHint) {
        showHintAnimation();
      }
    }, [props.showHint, showHintAnimation]);

    return (
      <View style={props.showHint ? {backgroundColor: styles.leftAction.backgroundColor} : null}>
        <Animated.View style={{transform: [{translateX: animatedValue}]}}>
          <WrappedComponent {...(restProps as P)} />
        </Animated.View>
      </View>
    );
  };
}
