/* @flow */

import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';

import Router from './components/router/router';
import Menu from './components/menu/menu';
import {routeMap} from './app-routes';

import {menuHeight} from './components/common-styles/header';

const styles = StyleSheet.create({
  flexBox: {
    flex: 1
  },
  view: {
    flexGrow: 1
  },
  navigation: {
    height: menuHeight
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
      const isMenuShown = currentRoute.routeName !== routeMap.EnterServer && currentRoute.routeName !== routeMap.LogIn;
      this.setState({isMenuShown});
    };

    return (
      <View style={styles.flexBox}>

        <View style={styles.view}>
          {Router.renderNavigatorView(onRoute)}
        </View>

        {this.state.isMenuShown && <View style={styles.navigation}>
          <Menu/>
        </View>}

      </View>
    );
  }
}
