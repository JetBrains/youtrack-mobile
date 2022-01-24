/* @flow */

import React, {PureComponent} from 'react';
import {Text, Dimensions, View} from 'react-native';

// $FlowFixMe: module throws on type check
import {TabView, TabBar} from 'react-native-tab-view';
import {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventSubscription';

import {isSplitView} from '../responsive/responsive-helper';

import styles from './issue-tabbed.style';

import type {Node} from 'React';
import type {TabRoute} from '../../flow/Issue';
import type {UITheme, UIThemeColors} from '../../flow/Theme';

export type IssueTabbedState = {
  index: number,
  routes: Array<TabRoute>,
  isTransitionInProgress: boolean,
  isSplitView: boolean,
};


export default class IssueTabbed extends PureComponent<void, IssueTabbedState> {
  initialWindowDimensions: any = Dimensions.get('window');
  tabRoutes: Array<TabRoute> = ['Details', 'Activity'].map((name: string) => ({key: name, title: name}));
  unsubscribeOnDimensionsChange: EventSubscription;

  state: IssueTabbedState = {
    index: 0,
    routes: this.tabRoutes,
    isTransitionInProgress: false,
    isSplitView: isSplitView(),
  };

  componentDidMount() {
    this.unsubscribeOnDimensionsChange = Dimensions.addEventListener('change', this.setSplitView);
  }

  componentWillUnmount(): void {
    this.unsubscribeOnDimensionsChange.remove();
  }

  renderDetails: ((uiTheme: UITheme) => null) = (uiTheme: UITheme) => null;

  renderActivity: ((uiTheme: UITheme) => null) = (uiTheme: UITheme) => null;

  isTabChangeEnabled: (() => boolean) = () => true;

  switchToDetailsTab: (() => void) = () => this.setState({index: 0});

  switchToActivityTab: (() => void) = () => this.setState({index: 1});

  isActivityTabEnabled: (() => boolean) = (): boolean => this?.state?.index === 1;

  setSplitView: () => void = (): void => {
    this.setState({isSplitView: isSplitView()});
  }

  getRouteBadge(route: TabRoute): any {
    return null;
  }

  renderTabBar(uiTheme: UITheme, editMode: boolean = false): ((props: any) => Node) {
    return (props: Object) => {
      const uiThemeColors: UIThemeColors = uiTheme.colors;
      return (
        <TabBar
          {...props}
          pressColor={uiThemeColors.$disabled}
          indicatorStyle={{backgroundColor: editMode ? 'transparent' : uiThemeColors.$link}}
          style={[styles.tabsBar, editMode ? {height: 1} : null, {shadowColor: uiThemeColors.$separator}]}
          renderLabel={({route, focused}) => {
            return (
              <View style={styles.tabLabel}>
                <Text style={[
                  styles.tabLabelText,
                  {
                    color: focused && !editMode
                      ? uiThemeColors.$link
                      : this.isTabChangeEnabled() ? uiThemeColors.$text : uiThemeColors.$disabled,
                  },
                ]}>
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

  renderScene: ((route: TabRoute, uiTheme: UITheme) => null) = (route: TabRoute, uiTheme: UITheme) => {
    if (route.key === this.tabRoutes[0].key) {
      return this.renderDetails(uiTheme);
    }
    return this.renderActivity(uiTheme);
  };

  renderTabs: ((uiTheme: UITheme) => Node) = (uiTheme: UITheme) => {
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
            this.setState({index});
          }
        }}
      />
    );
  };

  render(): null {
    return null;
  }
}
