import {Navigator} from 'react-native';
import React, {createElement} from 'react';

import {StackNavigator, addNavigationHelpers} from 'react-navigation';

/**
 * Route singleton
 */
class Router {
  constructor(navigator) {
    this._navigator = null;

    this.routes = {};
  }

  setNavigator = (navigator) => {
    if (!navigator) {
      return;
    }
    console.log('setNavigator', navigator)
    this._navigator = navigator;
  }

  registerRoute({name, component, props, type, animation}) {
    this.routes[name] = {
      screen: ({navigation}) => createElement(component, navigation.state.params),
      type,
      props,
      animation
    };

    if (!this[name]) {
      this[name] = (props) => this.navigate(name, props);
    }
  }

  finalizeRoutes(initialRouteName) {
    this.AppNavigator = StackNavigator(this.routes, {
      initialRouteName,
      headerMode: 'none'
    });
  }

  navigate(routeName, props) {
    if (!this._navigator) {
      throw `call setNavigator(navigator) first!`;
    }

    if (!this.routes[routeName]) {
      throw `no such route ${routeName}`;
    }

    const newRoute = Object.assign({}, this.routes[routeName]);
    newRoute.props = Object.assign({}, newRoute.props, props);

    // if (newRoute.type === 'replace') {
    //   return this._navigator.replace(newRoute);
    // }
    if (newRoute.type === 'reset') {
      // debugger
      this._navigator.dispatch({
        type: 'Navigation/RESET',
        index: 0,
        actions: [
          {type: 'Navigation/NAVIGATE', routeName, params: props}
        ]
      });
    }

    this._navigator.dispatch({type: 'Navigation/NAVIGATE', routeName, params: props});
  }

  pop() {
    if (this._navigator.state.nav.routes.length <= 1) {
      return false;
    }
    this._navigator.dispatch({type: 'Navigation/BACK'});
    return true;
  }

  _getNavigator() {
    return this._navigator;
  }

  renderNavigatorView() {
    const {AppNavigator} = this;
    return <AppNavigator ref={this.setNavigator}/>;
  }
}

export default new Router();
