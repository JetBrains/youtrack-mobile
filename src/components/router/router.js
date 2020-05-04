import React, {createElement} from 'react';
import {Easing, Animated} from 'react-native';

import StackViewStyleInterpolator from 'react-navigation-stack/lib/module/views/StackView/StackViewStyleInterpolator';
import {
  createStackNavigator,
  createAppContainer,
  StackActions,
  NavigationActions,
  StackViewTransitionConfigs
} from 'react-navigation';

import {getStorageState, flushStoragePart} from '../storage/storage';
import log from '../log/log';

const TransitionSpec = {
  duration: 500,
  easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
  timing: Animated.timing
};

const SlideFromRight = {
  transitionSpec: TransitionSpec,
  screenInterpolator: StackViewStyleInterpolator.forHorizontal
};

/**
 * Route singleton
 */
class Router {
  _currentRoute = null;
  rootRoutes = [];
  onDispatch = () => {};

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
  };

  getTransitionConfig = () => {
    if (!this._navigator) {
      return null;
    }
    const {nav} = this._navigator.state;
    const currentRouteName = nav.routes[nav.index].routeName;

    const route = this.routes[currentRouteName];

    if (route.modal || this._modalTransition) {
      return StackViewTransitionConfigs.defaultTransitionConfig(null, null, true);
    }

    return SlideFromRight;
  };

  registerRoute({name, component, props, type, modal}) {
    this.routes[name] = {
      screen: ({navigation}) => createElement(component, navigation.state.params),
      type,
      props,
      modal,
      defaultNavigationOptions: {
        gesturesEnabled: true
      }
    };

    if (!this[name]) {
      this[name] = (...args) => this.navigate(name, ...args);
    }
  }

  finalizeRoutes(initialRouteName) {
    const MainNavigator = createStackNavigator(this.routes, {
      initialRouteName,
      headerMode: 'none',
      transitionConfig: this.getTransitionConfig,
    });

    this.AppNavigator = createAppContainer(MainNavigator);
  }

  setOnDispatchCallback(onDispatch: Function<Object, ?string>) {
    this.onDispatch = onDispatch;
  }

  dispatch(data: Object, routeName?: string) {
    this._navigator.dispatch(data);
    this.onDispatch(routeName);
  }

  navigate(routeName, props, {forceReset} = {}) {
    log.info(`Navigating to ${routeName}`, {...props, imageHeaders: 'CENSORED'});
    if (!this._navigator) {
      throw `Router.navigate: call setNavigator(navigator) first!`;
    }

    if (!this.routes[routeName]) {
      throw `no such route ${routeName}`;
    }

    if (this.rootRoutes.includes(routeName)) {
      flushStoragePart({lastRoute: routeName});
    }

    const newRoute = Object.assign({}, this.routes[routeName]);
    newRoute.props = Object.assign({}, newRoute.props, props);

    if (newRoute.type === 'reset' || forceReset) {
      return this.dispatch(StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName, params: newRoute.props, key: Math.random().toString()})]
      }), routeName);
    }

    this.dispatch(NavigationActions.navigate({
      routeName,
      params: newRoute.props,
      key: Math.random().toString()
    }), routeName);
  }

  navigateToDefaultRoute(props: Object & {issueId: string} = null) {
    const defaultRoute = getStorageState().lastRoute || this.rootRoutes[0];
    this.navigate(defaultRoute, props);
    if (props && props.issueId) {
      this.navigate('SingleIssue', props);
    }
  }

  pop() {
    if (this._navigator.state.nav.routes.length <= 1) {
      return false;
    }
    this.dispatch(NavigationActions.back());
    return true;
  }

  _getNavigator() {
    return this._navigator;
  }

  onNavigationStateChange = (prevNav, nav, action) => {
    this._currentRoute = nav.routes[nav.index];
    if (action.type === NavigationActions.BACK) {
      const closingView = prevNav.routes[prevNav.index];
      this.onBack(closingView);
    }
  };

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
