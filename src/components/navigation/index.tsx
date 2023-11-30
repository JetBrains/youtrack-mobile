import * as React from 'react';

import Router from 'components/router/router';
import {
  NavigationNavigateActionPayload,
  NavigationRoute,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';

import {routeMap} from 'app-routes';

enum Navigators {
  AgileRoot = 'AgileRoot',
  BottomTabs = 'BottomTabs',
  InboxRoot = 'InboxRoot',
  IssuesRoot = 'IssuesRoot',
  KnowledgeBaseRoot = 'KnowledgeBaseRoot',
  LoginRoot = 'LoginRoot',
  SettingsRoot = 'SettingsRoot',
  TicketsRoot = 'TicketsRoot',
}

export type NavigatorKey = keyof Navigators;
export type NavigationRootNames = keyof typeof routeMap & NavigatorKey;
export type BottomTabsScreen = Record<NavigationRootNames, any>;

export interface INavigationParams {
  navigation: NavigationScreenProp<NavigationState>,
  route: NavigationNavigateActionPayload
}

export type INavigationRoute = NavigationRoute & {
  name: string
} | undefined;

const defaultScreenOptions = {
  gestureEnabled: true,
  headerShown: false,
  lazy: true,
  unmountOnBlur: true,
};

const spreadNavigationProps = (props: INavigationParams): INavigationParams & Record<string, any> => {
  return {...props, ...props?.route?.params};
};

const mixinNavigationProps = (Component: any): any => (props: INavigationParams) => {
  return <Component {...spreadNavigationProps(props)}/>;
};

const subscribeToScreenListeners = (routerKey: NavigatorKey): any => {
  return ({
    state: (e: { data?: { state: NavigationState } }) => {
      if (e?.data?.state) {
        Router[routerKey] = e?.data?.state;
      }
    },
  });
};

export {
  mixinNavigationProps,
  Navigators,
  defaultScreenOptions,
  spreadNavigationProps,
  subscribeToScreenListeners,
};
