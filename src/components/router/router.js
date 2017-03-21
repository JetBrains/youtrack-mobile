import React, {createElement} from 'react';
import {StackNavigator} from 'react-navigation';

const noAnimation = {
  transitionSpec: {
    duration: 0
  },
  screenInterpolator: null
};


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
    this._navigator = navigator;
  }

  getTransitionConfig = (transitionProps) => {
    if (!this._navigator) {
      return noAnimation;
    }
    const {nav} = this._navigator.state;
    const currentRouteName = nav.routes[nav.index].routeName;

    const route = this.routes[currentRouteName];
    if (route.type === 'reset') {
      return noAnimation;
    }
  }

  registerRoute({name, component, props, type, modal}) {
    this.routes[name] = {
      screen: ({navigation}) => createElement(component, navigation.state.params),
      type,
      props,
      modal
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
      throw `Router.navigate: call setNavigator(navigator) first!`;
    }

    if (!this.routes[routeName]) {
      throw `no such route ${routeName}`;
    }

    const newRoute = Object.assign({}, this.routes[routeName]);
    newRoute.props = Object.assign({}, newRoute.props, props);

    if (newRoute.type === 'reset') {
      this._navigator.dispatch({
        type: 'Navigation/RESET',
        index: 0,
        actions: [
          {type: 'Navigation/NAVIGATE', routeName, params: newRoute.props}
        ]
      });
    }

    this._navigator.dispatch({type: 'Navigation/NAVIGATE', routeName, params: newRoute.props});
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
    return <AppNavigator transitionConfig={this.getTransitionConfig} ref={this.setNavigator}/>;
  }
}

export default new Router();
