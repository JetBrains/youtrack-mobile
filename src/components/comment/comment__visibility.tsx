import React from 'react';
import {Text, View} from 'react-native';

import {IconLock} from 'components/icon/icon';

import styles from './comment__visibility.styles';

import type {ViewStyleProp} from 'types/Internal';

const CommentVisibility = ({
  presentation,
  color = styles.commentIcon.color,
  style,
}: {
  presentation?: string;
  color?: string;
  style?: ViewStyleProp;
}) => {
  return (
    <View testID="test:id/commentVisibility" style={[styles.commentVisibility, style]}>
      <IconLock testID="test:id/commentVisibilityIcon" size={16} style={styles.commentIcon} color={color} />
      {!!presentation && (
        <Text testID="test:id/commentVisibilityLabel" style={styles.commentVisibilityText}>
          {presentation}
        </Text>
      )}
    </View>
  );
};

export default React.memo(CommentVisibility);
