import React, {PureComponent} from 'react';
import {Text, Dimensions, View, EventSubscription} from 'react-native';

import {i18n} from 'components/i18n/i18n';
import {IconComment} from 'components/icon/icon';
import {isSplitView} from '../responsive/responsive-helper';
import {TabView, TabBar} from 'react-native-tab-view';

import styles from './issue-tabbed.style';

import type {TabRoute} from 'types/Issue';
import type {UITheme, UIThemeColors} from 'types/Theme';

export type IssueTabbedState = {
  index: number;
  routes: TabRoute[];
  isTransitionInProgress: boolean;
  isSplitView: boolean;
  navigateToActivity: boolean;
};


export default class IssueTabbed<P = {}, S = IssueTabbedState> extends PureComponent<P, S> {
  initialWindowDimensions: any = Dimensions.get('window');
  tabRoutes: TabRoute[] = [
    this.getMainTabText(),
    this.getSecondaryTabText(),
  ].map((name: string) => ({
    key: name,
    title: name,
  }));
  unsubscribeOnDimensionsChange: EventSubscription | undefined;
  // @ts-ignore
  state: IssueTabbedState = {
    index: 0,
    routes: this.tabRoutes,
    isTransitionInProgress: false,
    isSplitView: isSplitView(),
    navigateToActivity: false,
  };

  componentDidMount() {
    this.unsubscribeOnDimensionsChange = Dimensions.addEventListener(
      'change',
      this.setSplitView,
    );
  }

  componentWillUnmount(): void {
    this.unsubscribeOnDimensionsChange?.remove?.();
  }

  getMainTabText(): string {
    return i18n('Details');
  }

  getSecondaryTabText(): string {
    return i18n('Activity');
  }

  renderDetails: (uiTheme: UITheme) => null = (uiTheme: UITheme) => null;
  renderActivity: (uiTheme: UITheme) => null = (uiTheme: UITheme) => null;
  isTabChangeEnabled: () => boolean = () => true;
  switchToDetailsTab: () => void = () =>
    this.setState({
      index: 0,
    });
  switchToActivityTab: () => void = () =>
    this.setState({
      index: 1,
    });
  isActivityTabEnabled: () => boolean = (): boolean => this?.state?.index === 1;
  setSplitView: () => void = (): void => {
    this.setState({
      isSplitView: isSplitView(),
    });
  };

  getRouteBadge(isVisible: boolean, children: string | React.ReactNode): any {
    if (!isVisible) {
      return null;
    }

    return children ? (
      <View style={styles.tabBadge}>
        <IconComment
          size={17}
          color={styles.tabBadgeIcon.color}
          style={styles.tabBadgeIcon}
        />
        <Text style={styles.tabBadgeText}>{children}</Text>
      </View>
    ) : null;
  }

  renderTabBar(
    uiTheme: UITheme,
    editMode: boolean = false,
  ): (props: any)=> React.ReactNode {
    return (props: Record<string, any>) => {
      const uiThemeColors: UIThemeColors = uiTheme.colors;
      return (
        <TabBar
          {...props}
          pressColor={uiThemeColors.$disabled}
          indicatorStyle={{
            backgroundColor: editMode ? 'transparent' : uiThemeColors.$link,
          }}
          style={[
            styles.tabsBar,
            editMode
              ? {
                  height: 1,
                }
              : null,
            {
              shadowColor: uiThemeColors.$separator,
            },
          ]}
          renderLabel={({route, focused}) => {
            return (
              <View style={styles.tabLabel}>
                <Text
                  style={[
                    styles.tabLabelText,
                    {
                      color:
                        focused && !editMode
                          ? uiThemeColors.$link
                          : this.isTabChangeEnabled()
                          ? uiThemeColors.$text
                          : uiThemeColors.$disabled,
                    },
                  ]}
                >
                  {route.title}
                </Text>
                {this.getRouteBadge(route)}
              </View>
            );
          }}
        />
      );
    };
  }

  renderScene: (route: TabRoute, uiTheme: UITheme) => null = (
    route: TabRoute,
    uiTheme: UITheme,
  ) => {
    if (route.key === this.tabRoutes[0].key) {
      return this.renderDetails(uiTheme);
    }

    return this.renderActivity(uiTheme);
  };
  renderTabs: (uiTheme: UITheme)=> React.ReactNode = (uiTheme: UITheme) => {
    return (
      <TabView
        lazy
        swipeEnabled={this.isTabChangeEnabled()}
        navigationState={this.state}
        renderScene={({route}) => this.renderScene(route, uiTheme)}
        initialLayout={this.initialWindowDimensions}
        renderTabBar={this.renderTabBar(uiTheme)}
        onIndexChange={index => {
          if (this.isTabChangeEnabled()) {
            this.setState({
              index,
            });
          }
        }}
      />
    );
  };

  render(): null {
    return null;
  }
}
