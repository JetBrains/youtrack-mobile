/* @flow */

import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';

import Router from './components/router/router';
import Menu from './components/menu/menu';
import {routeMap} from './app-routes';

import {menuHeight} from './components/common-styles/header';
import {View as AnimatedView} from 'react-native-animatable';

const styles = StyleSheet.create({
  flexBox: {
    flex: 1
  },
  view: {
    flexGrow: 1
  },
  navigation: {
    height: menuHeight
  },
  navigationHidden: {
    position: 'absolute',
    bottom: -100
  }
});


export default class Navigation extends PureComponent<{}, {isMenuShown: boolean}> {
  constructor() {
    super();

    this.state = {
      isMenuShown: false
    };
  }

  render() {
    const onRoute = (currentRoute) => {
      const isMenuShown = (
        currentRoute.routeName !== routeMap.Home &&
        currentRoute.routeName !== routeMap.EnterServer &&
        currentRoute.routeName !== routeMap.LogIn &&
        currentRoute.routeName !== routeMap.Image &&
        currentRoute.routeName !== routeMap.AttachmentPreview &&
        currentRoute.routeName !== routeMap.CreateIssue
      );
      this.setState({isMenuShown});
    };

    return (
      <View style={styles.flexBox}>

        <View style={styles.view}>
          {Router.renderNavigatorView(onRoute)}
        </View>

        <AnimatedView
          animation="slideInUp"
          duration={500}
          useNativeDriver
          style={[
            styles.navigation,
            this.state.isMenuShown ? null : styles.navigationHidden
          ]}>
          <Menu/>
        </AnimatedView>

      </View>
    );
  }
}
