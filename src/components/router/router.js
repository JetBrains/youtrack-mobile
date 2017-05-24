import React, {createElement} from 'react';
import {Easing, Animated} from 'react-native';
import {StackNavigator, NavigationActions} from 'react-navigation/lib/react-navigation';
import transitionConfigs from 'react-navigation/lib/views/TransitionConfigs';
import cardInterpolator from 'react-navigation/lib/views/CardStackStyleInterpolator';

const TransitionSpec = {
  duration: 500,
  easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
  timing: Animated.timing
};

const SlideFromRight = {
  transitionSpec: TransitionSpec,
  screenInterpolator: cardInterpolator.forHorizontal
};

/**
 * Route singleton
 */
class Router {
  constructor(navigator) {
    this._navigator = null;
    this.onBack = () => {};

    this.routes = {};
  }

  setNavigator = (navigator) => {
    if (!navigator) {
      return;
    }
    this._navigator = navigator;
  }

  getTransitionConfig = () => {
    if (!this._navigator) {
      return null;
    }
    const {nav} = this._navigator.state;
    const currentRouteName = nav.routes[nav.index].routeName;

    const route = this.routes[currentRouteName];

    if (route.modal || this._modalTransition) {
      return transitionConfigs.defaultTransitionConfig(null, null, true);
    }

    return SlideFromRight;
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
      headerMode: 'none',
      transitionConfig: this.getTransitionConfig,
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
      return this._navigator.dispatch(NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName, params: newRoute.props})]
      }));
    }

    this._navigator.dispatch(NavigationActions.navigate({routeName, params: newRoute.props}));
  }

  pop() {
    if (this._navigator.state.nav.routes.length <= 1) {
      return false;
    }
    this._navigator.dispatch(NavigationActions.back());
    return true;
  }

  _getNavigator() {
    return this._navigator;
  }

  onNavigationStateChange = (prevNav, nav, action) => {
    if (action.type === NavigationActions.BACK) {
      const closingView = prevNav.routes[prevNav.index];
      this.onBack(closingView);
    }
  }

  renderNavigatorView() {
    const {AppNavigator} = this;
    return (
      <AppNavigator
        ref={this.setNavigator}
        onNavigationStateChange={this.onNavigationStateChange}
      />
    );
  }
}

export default new Router();
