import {View, Text, Image} from 'react-native';
import React from 'react';
import styles from './comment.styles';

export default class Comment extends React.Component {
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
