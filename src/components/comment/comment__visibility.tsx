import React from 'react';
import { Text, View } from 'react-native';

import { IconLock } from 'components/icon/icon';

import styles from './comment__visibility.styles';

import type { ViewStyleProp } from 'types/Internal';

const CommentVisibility = ({
  presentation,
  color = styles.commentIcon.color,
  style,
}: {
  presentation: string | null;
  color?: string;
  style?: ViewStyleProp;
}) => {
  return presentation ? (
    <View testID="commentVisibility" style={[styles.commentVisibility, style]}>
      <IconLock
        testID="commentVisibilityIcon"
        size={16}
        style={styles.commentIcon}
        color={color}
      />
      <Text style={styles.commentVisibilityText}>
        {presentation}
      </Text>
    </View>
  ) : null;
};

export default React.memo(CommentVisibility);
