import {Text, View, TouchableOpacity} from 'react-native';
import React, {PropTypes} from 'react';
import styles from './header.styles';
import Router from '../router/router';

const TOUCH_PADDING = 8;

export default class Header extends React.Component {
  static propTypes = {
    onBack: PropTypes.func,
    onRightButtonClick: PropTypes.func,
    leftButton: PropTypes.element,
    rightButton: PropTypes.element
  }

  onBack() {
    if (this.props.onBack) {
      return this.props.onBack();
    }
    return Router.pop();
  }

  onRightButtonClick() {
    if (this.props.onRightButtonClick) {
      return this.props.onRightButtonClick();
    }
  }

  render() {
    return (<View style={styles.header}>
      <TouchableOpacity
        hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}
        style={styles.headerButton}
        onPress={() => this.onBack()}>
        <Text style={styles.headerButtonText}>{this.props.leftButton}</Text>
      </TouchableOpacity>

      <View style={styles.headerCenter}>{this.props.children}</View>

      <TouchableOpacity
        hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}
        style={styles.headerButton}
        onPress={this.onRightButtonClick.bind(this)}>
        <Text style={[styles.headerButtonText, styles.headerButtonTextRight]}>{this.props.rightButton}</Text>
      </TouchableOpacity>
    </View>);
  }
}
