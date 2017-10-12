/* @flow */
import {View, Text, Image} from 'react-native';
import React, {Component} from 'react';
import styles from './comment.styles';

type Props = {
  text: string,
  icon: Object
}

export default class Comment extends Component<Props, void> {
  _renderIcon() {
    if (this.props.icon) {
      return <Image source={this.props.icon} style={styles.swipeButtonIcon}/>;
    }
  }

  render() {
    return (
      <View style={styles.swipeButton}>
        {this._renderIcon()}
        <Text style={styles.swipeButtonText}>{this.props.text}</Text>
      </View>
    );
  }
}
