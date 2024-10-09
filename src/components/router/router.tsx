import React from 'react';

import {
  createAppContainer,
  StackActions,
  NavigationActions,
  NavigationNavigateAction,
  NavigationRoute,
  NavigationContainer,
  NavigationEventPayload,
  NavigationContainerComponent,
  NavigationAction,
  NavigationNavigateActionPayload,
} from 'react-navigation';
import {createStackNavigator, StackViewTransitionConfigs} from 'react-navigation-stack';

import log from 'components/log/log';
import {flushStoragePart} from 'components/storage/storage';
import {isIOSPlatform} from 'util/util.tsx';
import {isSplitView} from 'components/responsive/responsive-helper';
import {routeMap} from 'app-routes';

import type {NavigationResetAction} from 'react-navigation';

type RouterMethodName = keyof typeof routeMap;
type Navigator = NavigationContainer & NavigationContainerComponent;

interface AppRoute {
  screen: ({navigation}: {navigation: NavigationEventPayload}) => React.ReactNode;
  type?: string;
  props: Record<string, any>;
  modal?: boolean;
  defaultNavigationOptions: {gesturesEnabled: boolean};
}

class Router {
  [index: RouterMethodName | string]: any;

  _navigator: Navigator | undefined;
  _currentRoute: NavigationNavigateActionPayload | null = null;
  rootRoutes: Array<string> = [];
  onDispatchCallbacks: Array<(...args: any[]) => any> = [];
  routes: {[routeName: string]: AppRoute} = {};

  onBack(p: NavigationNavigateActionPayload): void {}

  setNavigator = (navigator: Navigator) => {
    this._navigator = navigator;
  };

  getTransitionConfig = () => {
    if (!this._navigator) {
      return null;
    }
    const nav = this._navigator.state.nav;
    const currentRouteName = nav ? nav.routes[nav.index].routeName : '';
    const route = this.routes[currentRouteName];
    if (route.modal || this._modalTransition) {
      return StackViewTransitionConfigs.ModalSlideFromBottomIOS;
    }
    return StackViewTransitionConfigs.SlideFromRightIOS;
  };

  registerRoute({name, component, props, type, modal, tabletComponentName}: Record<string, any>) {
    this.routes[name] = {
      screen: ({navigation}) => React.createElement(component, navigation.state.params),
      type,
      props,
      modal,
      defaultNavigationOptions: {
        gesturesEnabled: true,
      },
    };

    if (!this[name]) {
      this[name] = (params: Record<string, any>) => {
        this.navigate(tabletComponentName && isSplitView() ? tabletComponentName : name, params);
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

  setOnDispatchCallback(onDispatch: (...args: any[]) => any) {
    this.onDispatchCallbacks.push(onDispatch);
    return () => {
      const index: number = this.onDispatchCallbacks.indexOf(onDispatch);
      this.onDispatchCallbacks.splice(index, 1);
    };
  }

  dispatch(action: NavigationAction, routeName?: string, prevRouteName?: string, options?: Record<string, any>) {
    if (this._navigator) {
      this._navigator.dispatch(action);
      this.onDispatchCallbacks.forEach(onDispatch => onDispatch(routeName, prevRouteName, options));
    }
  }

  navigate(routeName: string, props: Record<string, any>, {forceReset = false} = {}) {
    log.info(`Router(navigate): -> ${routeName}`);
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
    const prevRouteName: string | undefined = this._currentRoute?.routeName;
    const navigationData: NavigationNavigateAction = NavigationActions.navigate({
      routeName,
      params: newRoute.props,
      key: routeName,
    });

    if (newRoute.type === 'reset' || forceReset) {
      try {
        if (this._navigator && isIOSPlatform()) {
          this._navigator._navigation.dismiss();
        }
      } catch (e) {
        log.info('Router:(navigate dismiss)', e);
      }
      this.dispatch(
        StackActions.reset({
          index: 0,
          actions: [navigationData],
          key: null,
        }),
        routeName,
        prevRouteName
      );
    } else {
      this.dispatch(navigationData, routeName, prevRouteName);
    }
  }

  navigateToDefaultRoute(props?: {
    issueId?: string;
    articleId?: string;
    navigateToActivity?: string;
    searchQuery?: string;
    helpdeskFormId?: string;
  }) {
    const defaultRoute: string = this.rootRoutes[0];
    let route = null;
    const params: typeof props & {uuid?: string} = Object.assign({}, props);
    if (props?.issueId) {
      route = routeMap.Issue;
    }
    if (props?.articleId) {
      route = routeMap.ArticleSingle;
    }
    if (props?.helpdeskFormId) {
      params.uuid = props.helpdeskFormId;
      route = routeMap.HelpDeskFeedback;
    }
    if (route) {
      this.navigate(route, params, {forceReset: true});
    } else {
      this.navigate(defaultRoute, params);
    }
  }

  getRoutes = (): NavigationRoute[] => this._navigator?.state?.nav?.routes || [];

  hasNoParentRoute = (): boolean => {
    const routes = this.getRoutes();
    return routes.length <= 1 || (routes[routes.length - 2] && routes[routes.length - 2].routeName === routeMap.Home);
  };

  pop(isModalTransition?: boolean, options?: Record<string, any>) {
    if (this.hasNoParentRoute()) {
      return false;
    }

    this._modalTransition = isModalTransition;
    const routes: NavigationRoute[] = this.getRoutes();
    this.dispatch(NavigationActions.back(), routes[routes.length - 2].routeName, this.getCurrentRouteName(), options);
    return true;
  }

  getCurrentRouteName(): string {
    return this._currentRoute?.routeName || '';
  }

  onNavigationStateChange = (
    prevNav: NavigationRoute,
    nav: NavigationRoute,
    action: NavigationAction,
    onRoute: (currentRoute: NavigationNavigateActionPayload) => void
  ) => {
    this._currentRoute = nav.routes[nav.index];
    if (this._currentRoute) {
      onRoute(this._currentRoute);
    }

    if (action.type === NavigationActions.BACK) {
      const closingView = prevNav.routes[prevNav.index];
      this.onBack(closingView);
    }
  };

  renderNavigatorView(onRoute: (currentRoute: NavigationNavigateActionPayload) => void) {
    const {AppNavigator} = this;
    return (
      <AppNavigator
        ref={this.setNavigator}
        onNavigationStateChange={(prevNav: NavigationRoute, nav: NavigationRoute, action: NavigationResetAction) => {
          this.onNavigationStateChange(prevNav, nav, action, onRoute);
        }}
      />
    );
  }
}

export default new Router();
