import React from 'react';
import { Text, View } from 'react-native';

import { IconLock } from 'components/icon/icon';

import styles from './comment__visibility.styles';

import type { ViewStyleProp } from 'types/Internal';


const CommentVisibility = (props: {
  presentation: string | null;
  color?: string;
  style?: ViewStyleProp;
}) => {
  return props.presentation ? (
    <View
      testID="commentVisibility"
      style={[styles.commentVisibility, props.style]}
    >
      <IconLock testID="commentVisibilityIcon" size={16} color={props.color} />
      <Text
        style={[
          styles.commentVisibilityText,
          props.color && { color: props.color },
        ]}
      >
        {props.presentation}
      </Text>
    </View>
  ) : null;
};

export default React.memo(CommentVisibility);
