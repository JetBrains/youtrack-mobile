/* @flow */
import {Text, View, TouchableOpacity, StatusBar, Image} from 'react-native';
import React, {Component} from 'react';
import styles from './header.styles';
import Router from '../router/router';
import getTopPadding, {onHeightChange} from './header__top-padding';
import type {Node} from 'react';
import {qrCode} from '../icon/icon';
import Feature from '../feature/feature';
import {openScanView} from '../../actions/app-actions';

import connect from 'react-redux/es/connect/connect';

const TOUCH_PADDING = 8;

type Props = {
  onBack?: () => any,
  onRightButtonClick?: Function,
  leftButton?: ?React$Element<any>,
  rightButton?: ?React$Element<any>,
  children?: Node,
  openScanView: Function
}

type DefaultProps = {
  onRightButtonClick: Function
}

class Header extends Component<Props, void> {
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
    const {leftButton, children, rightButton} = this.props;

    return (
      <View style={[styles.header, {paddingTop: getTopPadding()}]}>
        <StatusBar animated barStyle="light-content"/>
        <TouchableOpacity
          testID="header-back"
          hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}
          style={[styles.headerButton, styles.headerButtonLeft]}
          onPress={() => this.onBack()}
        >
          <Text style={styles.headerButtonText} numberOfLines={1}>{leftButton}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter} testID="header-content">{children}</View>

        <Feature name={'industrial'}>
          <TouchableOpacity
            testID="qr-code-scan-action"
            hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}
            style={[styles.headerButton, styles.headerButtonRight]}
            onPress={this.props.openScanView}>
            <Image style={{height: 20, width: 20}} source={qrCode}></Image>
          </TouchableOpacity>
        </Feature>

        <TouchableOpacity
          testID="header-action"
          hitSlop={{top: TOUCH_PADDING, left: TOUCH_PADDING, bottom: TOUCH_PADDING, right: TOUCH_PADDING}}
          style={[styles.headerButton, styles.headerButtonRight]}
          onPress={this.onRightButtonClick.bind(this)}>
          <Text style={[styles.headerButtonText]} numberOfLines={1}>{rightButton}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    openScanView: () => dispatch(openScanView()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
