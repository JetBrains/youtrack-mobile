import React from 'react';
import {Animated, Text, View} from 'react-native';

import styles from './swipeable.styles';

import type {SwipeAction} from 'components/swipeable/index';

const SwipeableAction = ({
  action,
  isLeft,
  width,
  scale,
}: {
  action: SwipeAction;
  isLeft: boolean;
  width: string;
  scale: Animated.Value;
}) => {
  return (
    <View
      style={[
        styles.actionContainer,
        !isLeft && styles.actionContainerRight,
        {
          backgroundColor: action.actionColor?.backgroundColor || styles.actionContainer.backgroundColor,
          width,
        },
      ]}
    >
      <Animated.View style={{transform: [{scale: scale ?? 1}]}}>{action.icon}</Animated.View>
      {action.text && (
        <Text
          style={[
            styles.actionText,
            !isLeft && styles.actionTextRight,
            {color: action.actionColor?.color || styles.actionText.color},
          ]}
        >
          {action.text}
        </Text>
      )}
    </View>
  );
};

export default React.memo(SwipeableAction);
