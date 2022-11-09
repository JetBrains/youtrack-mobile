import React, {createElement} from 'react';
import {Easing, Animated} from 'react-native';

import StackViewStyleInterpolator from 'react-navigation-stack/lib/module/views/StackView/StackViewStyleInterpolator';
import {
  createStackNavigator,
  createAppContainer,
  StackActions,
  NavigationActions,
  NavigationNavigateAction,
  NavigationRoute,
} from 'react-navigation';

import log from '../log/log';
import {flushStoragePart} from '../storage/storage';
import {isSplitView} from '../responsive/responsive-helper';
import {guid} from 'util/util';
import {routeMap} from '../../app-routes';

import type {
  NavigationNavigator,
  NavigationResetActionPayload,
  NavigationJumpToActionPayload,
  NavigationState,
  NavigationResetAction,
} from 'react-navigation';

const TransitionSpec = {
  duration: 500,
  easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
  timing: Animated.timing,
};

const SlideFromRight = {
  transitionSpec: TransitionSpec,
  screenInterpolator: StackViewStyleInterpolator.forHorizontal,
};

const SlideModal = {
  transitionSpec: TransitionSpec,
  screenInterpolator: (sceneProps) => {
    const route = sceneProps.scenes[sceneProps.scenes.length - 1].route;
    if (route?.routeName === routeMap.Modal && sceneProps.scenes.length > 1) {
      return StackViewStyleInterpolator.forFade;
    }

    return StackViewStyleInterpolator.forVertical;
  },
};

/**
 * Route singleton
 */
class Router {
  _navigator:NavigationNavigator = null;
  _currentRoute:NavigationJumpToActionPayload = null;
  rootRoutes: Array<NavigationJumpToActionPayload> = [];
  onDispatchCallbacks: ?Array<Function> = [];

  constructor() {
    this.onBack = () => {};
    this.routes = {};
  }

  setNavigator = (navigator?: NavigationNavigator) => {
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
      return SlideModal;
    }

    return SlideFromRight;
  };

  registerRoute({name, component, props, type, modal, tabletComponentName}) {
    this.routes[name] = {
      screen: ({navigation}) => createElement(component, navigation.state.params),
      type,
      props,
      modal,
      defaultNavigationOptions: {
        gesturesEnabled: true,
      },
    };

    if (!this[name]) {
      this[name] = (...args) => {
        this.navigate(tabletComponentName && isSplitView() ? tabletComponentName : name, ...args);
      };
    }
  }

  finalizeRoutes(initialRouteName: string) {
    const MainNavigator = createStackNavigator(this.routes, {
      initialRouteName,
      headerMode: 'none',
      transitionConfig: this.getTransitionConfig,
    });

    this.AppNavigator = createAppContainer(MainNavigator);
  }

  setOnDispatchCallback(onDispatch: Function<Object, ?string>) {
    this.onDispatchCallbacks.push(onDispatch);
    return () => {
      const index: number = this.onDispatchCallbacks.indexOf(onDispatch);
      this.onDispatchCallbacks.splice(index, 1);
    };
  }

  dispatch(data: NavigationResetActionPayload, routeName?: string, prevRouteName?: string, options?: Object) {
    this._navigator.dispatch(data);
    this.onDispatchCallbacks.forEach(onDispatch => onDispatch(routeName, prevRouteName, options));
  }

  navigate(routeName: string, props: Object, {forceReset} = {}) {
    log.info(`Router(navigate) ${routeName}`, {...props, imageHeaders: 'CENSORED'});
    if (!this._navigator) {
      throw 'Router(navigate): call setNavigator(navigator) first!';
    }

    if (!this.routes[routeName]) {
      throw `no such route ${routeName}`;
    }

    if (this.rootRoutes.includes(routeName) || props?.store === true) {
      flushStoragePart({lastRoute: props?.storeRouteName || routeName});
    }

    const newRoute = Object.assign({}, this.routes[routeName]);
    newRoute.props = Object.assign({}, newRoute.props, props);

    const prevRouteName: ?string = this._currentRoute?.routeName;
    const navigationData: NavigationNavigateAction = NavigationActions.navigate({
      routeName,
      params: newRoute.props,
      key: guid(),
    });

    if (newRoute.type === 'reset' || forceReset) {
      this.dispatch(StackActions.reset({
        index: 0,
        actions: [navigationData],
      }), routeName, prevRouteName);
    } else {
      this.dispatch(navigationData, routeName, prevRouteName);
    }
  }

  navigateToDefaultRoute(props: Object & { issueId: string } = null) {
    const defaultRoute: string = this.rootRoutes[0];
    if (props?.issueId) {
      this.navigate(routeMap.Issue, props, {forceReset: true});
    } else {
      this.navigate(defaultRoute, props);
    }
  }

  getRoutes: Array<NavigationRoute> = () => this._navigator.state.nav.routes;

  hasNoParentRoute: Array<NavigationRoute> = () => this.getRoutes().length <= 1;

  pop(isModalTransition?: boolean, options?: Object) {
    if (this.hasNoParentRoute()) {
      return false;
    }
    this._modalTransition = isModalTransition;
    const routes: Array<NavigationRoute> = this.getRoutes();
    this.dispatch(NavigationActions.back(), routes[routes.length - 2].routeName, this.getCurrentRouteName(), options);
    return true;
  }

  backTo(index: number) {
    let count = index;
    while (count > 0) {
      if (this.hasNoParentRoute()) {
        return false;
      }
      this.pop();
      count--;
    }
    return true;
  }

  _getNavigator() {
    return this._navigator;
  }

  getCurrentRouteName(): string {
    return this._currentRoute.routeName;
  }

  onNavigationStateChange = (prevNav, nav, action, onRoute: (currentRoute: NavigationJumpToActionPayload) => any) => {
    this._currentRoute = nav.routes[nav.index];
    onRoute(this._currentRoute);
    if (action.type === NavigationActions.BACK) {
      const closingView = prevNav.routes[prevNav.index];
      this.onBack(closingView);
    }
  };

  renderNavigatorView(onRoute?: (currentRoute: NavigationJumpToActionPayload) => any) {
    const {AppNavigator} = this;
    return (
      <AppNavigator
        ref={this.setNavigator}
        onNavigationStateChange={(prevNav: NavigationState, nav: NavigationState, action: NavigationResetAction) => {
          this.onNavigationStateChange(prevNav, nav, action, onRoute);
        }}
      />
    );
  }
}

export default new Router();
