/* @flow */
import {Text, View, TouchableOpacity, StatusBar} from 'react-native';
import React, {PureComponent} from 'react';
import styles from './header.styles';
import Router from '../router/router';
import {onHeightChange} from './header__top-padding';
import type {Node} from 'react';
import {UNIT} from '../variables/variables';

const TOUCH_PADDING = UNIT;

type Props = {
  onBack?: () => any,
  onRightButtonClick?: Function,
  leftButton?: ?React$Element<any>,
  rightButton?: ?React$Element<any>,
  extraButton?: ?React$Element<any>,
  children?: Node,
  openScanView?: Function
}

type DefaultProps = {
  onRightButtonClick: Function
}

export default class Header extends PureComponent<Props, void> {
  static defaultProps: DefaultProps = {
    onRightButtonClick: () => undefined,
  };

  componentDidMount() {
    onHeightChange(() => this.forceUpdate());
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
    const {leftButton, children, extraButton, rightButton} = this.props;

    return (
      <View style={styles.header}>
        <StatusBar animated barStyle="light-content"/>
        <TouchableOpacity
          testID="header-back"
          hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}
          style={styles.headerButtonLeft}
          onPress={() => this.onBack()}
        >
          <Text style={styles.headerButtonText} numberOfLines={1}>{leftButton}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter} testID="header-content">{children}</View>

        {extraButton}

        <TouchableOpacity
          testID="header-action"
          hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}
          style={styles.headerButtonRight}
          onPress={() => this.onRightButtonClick()}>
          <Text style={styles.headerButtonText} numberOfLines={1}>{rightButton}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
