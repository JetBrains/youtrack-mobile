import * as React from 'react';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {menuIconHelpdesk, menuIconIssues, menuIconAgile, menuIconKB, menuIconSettings} from 'components/icon/icon';

import AgileStackNavigator from 'components/navigation/navigation-agile-stack';
import InboxStackNavigator from 'components/navigation/navigation-inbox-stack';
import IssuesStackNavigator from './navigation-issues-stack';
import KnowledgeBaseStackNavigator from 'components/navigation/navigation-kb-stack';
import NavigationInboxIcon from 'components/navigation/navigation-inbox-icon';
import SettingsStackNavigator from 'components/navigation/navigation-settings-stack';
import TicketsStackNavigator from 'components/navigation/navigation-tickets-stack';
import {BottomTabsScreen, defaultScreenOptions, Navigators} from './index';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';

import styles from './navigation.styles';
import NavigationIcon from 'components/navigation/navigation-icon';

interface NavigatorRoute {
  icon: string | any,
  size: number;
  testID: string
}

const rootRouteTabsData: { [key in keyof Navigators]: NavigatorRoute } = {
  [Navigators.IssuesRoot]: {icon: menuIconIssues, size: 24, testID: 'test:id/menuIssues'},
  [Navigators.TicketsRoot]: {icon: menuIconHelpdesk, size: 23, testID: 'test:id/menuTickets'},
  [Navigators.AgileRoot]: {icon: menuIconAgile, size: 23, testID: 'test:id/menuAgile'},
  [Navigators.InboxRoot]: {icon: NavigationInboxIcon, size: 23, testID: 'test:id/menuNotifications'},
  [Navigators.KnowledgeBaseRoot]: {icon: menuIconKB, size: 25, testID: 'test:id/menuKnowledgeBase'},
  [Navigators.SettingsRoot]: {icon: menuIconSettings, size: 23, testID: 'test:id/menuSettings'},
};

const BottomTabs = createBottomTabNavigator<BottomTabsScreen>();


export default function NavigationBottomTabs() {
  const isInboxEnabled: boolean = checkVersion(FEATURE_VERSION.inbox);
  const isKBEnabled: boolean = checkVersion(FEATURE_VERSION.knowledgeBase);
  const isHDEnabled: boolean = checkVersion(FEATURE_VERSION.helpDesk);

  const screenOptions = {
    ...defaultScreenOptions,
    tabBarInactiveTintColor: styles.icon.color,
    tabBarActiveTintColor: styles.link.color,
  };

  return (
    <BottomTabs.Navigator
      screenOptions={({route}: any) => {
        const navRoute: NavigatorRoute = rootRouteTabsData[route.name];
        return {
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarShowLabel: false,
          tabBarIcon: ({color}: {color: string}) => {
            const Icon = navRoute.icon;
            if (typeof Icon !== 'string') {
              return <Icon size={navRoute.size} color={color} />;
            }
            return <NavigationIcon xml={Icon} size={navRoute.size} color={color} />;
          },
          tabBarTestID: navRoute.testID,
        };
      }}
    >
      <BottomTabs.Screen
        name={Navigators.IssuesRoot}
        component={IssuesStackNavigator}
        options={screenOptions}
      />

      {isHDEnabled && (
        <BottomTabs.Screen
          name={Navigators.TicketsRoot}
          component={TicketsStackNavigator}
          options={screenOptions}
        />
      )}

      <BottomTabs.Screen
        name={Navigators.AgileRoot}
        component={AgileStackNavigator}
        options={screenOptions}
      />

      {isInboxEnabled && <BottomTabs.Screen
        name={Navigators.InboxRoot}
        component={InboxStackNavigator}
        options={screenOptions}
      />}

      {isKBEnabled && <BottomTabs.Screen
        name={Navigators.KnowledgeBaseRoot}
        component={KnowledgeBaseStackNavigator}
        options={screenOptions}
      />}

      <BottomTabs.Screen
        name={Navigators.SettingsRoot}
        component={SettingsStackNavigator}
        options={screenOptions}
      />
    </BottomTabs.Navigator>
  );
}
