import React from 'react';
import {Text, View} from 'react-native';

import {IconLock} from 'components/icon/icon';

import styles from './comment__visibility-presentation.styles';

import type {TextStyleProp, ViewStyleProp} from 'types/Internal';

const CommentVisibilityPresentation = ({
  presentation,
  iconFirst,
  textStyle,
  style,
}: {
  presentation?: string | React.ReactNode;
  iconFirst?: boolean;
  textStyle?: TextStyleProp;
  style?: ViewStyleProp;
}) => {
  const color = textStyle?.color || styles.commentIcon.color;
  const icon = (
    <IconLock
      testID="test:id/commentVisibilityIcon"
      size={16}
      style={[styles.commentIcon, iconFirst && styles.commentIconFirst, textStyle]}
      color={color}
    />
  );
  return (
    <View testID="test:id/commentVisibility" style={[styles.commentVisibility, style]}>
      {iconFirst && icon}
      {!!presentation &&
        <Text testID="test:id/commentVisibilityLabel" style={styles.commentVisibilityText}>
          {presentation}
        </Text>
      }
      {!iconFirst && icon}
    </View>
  );
};

export default React.memo(CommentVisibilityPresentation);
