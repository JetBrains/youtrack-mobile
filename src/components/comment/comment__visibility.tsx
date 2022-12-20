import {Text, View} from 'react-native';
import React, {PureComponent} from 'react';
import {IconLock} from '../icon/icon';
import styles from './comment__visibility.styles';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  visibility: string | null | undefined;
  color: string;
  style?: ViewStyleProp;
};
export default class CommentVisibility extends PureComponent<Props, void> {
  render(): React.ReactNode {
    if (this.props.visibility) {
      return (
        <View
          testID="commentVisibility"
          style={[styles.commentVisibility, this.props.style]}
        >
          <IconLock
            testID="commentVisibilityIcon"
            size={16}
            color={this.props.color}
          />
          <Text
            style={[
              styles.commentVisibilityText,
              this.props.color
                ? {
                    color: this.props.color,
                  }
                : null,
            ]}
          >
            {this.props.visibility}
          </Text>
        </View>
      );
    }

    return null;
  }
}
