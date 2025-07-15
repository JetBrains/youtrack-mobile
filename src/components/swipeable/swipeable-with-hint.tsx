import * as React from 'react';
import {Animated, Easing, View} from 'react-native';

import styles from './swipeable.styles';

export type SwipeDirection = 'left' | 'right';

export interface WithHintProps {
  showHint?: boolean;
  hintDirection?: SwipeDirection;
  hintDistance?: number;
  onDismiss?: () => void;
}

const config = {
  easing: Easing.quad,
  useNativeDriver: true,
};

export function SwipeableWithHint<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithHintProps> {
  return function WithSwipeHint(props: P & WithHintProps) {
    const {hintDistance = 60, hintDirection = 'left', onDismiss = () => {}, ...restProps} = props;
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    const showHintAnimation = React.useCallback(() => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        ...config,
        toValue: hintDirection === 'left' ? hintDistance : -hintDistance,
      }).start(() => {
        Animated.timing(animatedValue, {...config, duration: 100, toValue: 0}).start(onDismiss);
      });
    }, [animatedValue, hintDirection, hintDistance, onDismiss]);

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
