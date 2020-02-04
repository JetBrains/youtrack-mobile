/* @flow */

import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import styles, {COLOR} from './comment__visibility.styles';

type Props = {
  visibility: ?string,
  color?: string
};

export default class CommentVisibility extends PureComponent<Props, void> {

  render() {
    if (this.props.visibility) {
      return (
        <View
          testID="commentVisibility"
          style={styles.commentVisibility}>
          <Icon testID="commentVisibilityIcon" name="lock" size={16} color={this.props.color || COLOR}/>
          <Text style={[
            styles.commentVisibilityText,
            this.props.color ? {color: this.props.color} : null
          ]}>
            {this.props.visibility}
          </Text>
        </View>
      );
    }
    return null;
  }
}
