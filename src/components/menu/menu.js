/* @flow */

import React, {Component} from 'react';
import {View as AnimatedView} from 'react-native-animatable';
import {connect} from 'react-redux';

import Feature, {FEATURES} from '../feature/feature';
import Router from '../router/router';
import {DEFAULT_THEME} from '../theme/theme';
import {IconBell, IconBoard, IconSettings, IconTask, IconKnowledgeBase} from '../icon/icon';
import {MenuItem} from './menu__item';
import {routeMap} from '../../app-routes';

import styles from './menu.styles';

import type {UITheme} from '../../flow/Theme';

type Props = {
  isVisible: boolean,
  isDisabled: boolean,
  uiTheme: UITheme
}

type State = {
  prevRouteName: ?string,
  currentRouteName: ?string
}

class Menu extends Component<Props, State> {
  static defaultProps: Props = {
    isVisible: false,
    isDisabled: false,
    uiTheme: DEFAULT_THEME
  };

  constructor() {
    super();

    this.state = {
      prevRouteName: null,
      currentRouteName: null
    };

    Router.setOnDispatchCallback((routeName: ?string, prevRouteName: ?string) => {
      this.setCurrentRouteName(routeName, prevRouteName);
    });
  }


  setCurrentRouteName = (routeName: ?string, prevRouteName: ?string) => this.setState({
    prevRouteName: prevRouteName,
    currentRouteName: routeName
  });

  isActiveRoute = (routeName: string) => {
    if (this.state.currentRouteName === routeMap.Issue) {
      return this.state.prevRouteName === routeName;
    }

    if (this.state.currentRouteName === routeMap.Article) {
      return (
        this.state.prevRouteName === routeName ||
        (this.state.prevRouteName === routeMap.Page && routeMap.KnowledgeBase === routeName)
      );
    }
    if (this.state.currentRouteName === routeMap.Page) {
      return routeMap.KnowledgeBase === routeName && (
        this.state.prevRouteName === routeMap.Article ||
        this.state.prevRouteName === routeMap.KnowledgeBase
      );
    }

    return this.state.currentRouteName === routeName;
  };

  canNavigateTo = (routeName: string) => {
    if (this.props.isDisabled) {
      return false;
    }
    if (
      this.state.currentRouteName === routeMap.Issue ||
      this.state.currentRouteName === routeMap.Page ||
      this.state.currentRouteName === routeMap.Article
    ) {
      return true;
    }

    return !this.isActiveRoute(routeName);
  };

  openIssueList = () => {
    if (this.canNavigateTo(routeMap.Issues)) {
      Router.Issues();
    }
  };

  openAgileBoard = () => {
    if (this.canNavigateTo(routeMap.AgileBoard)) {
      Router.AgileBoard();
    }
  };

  openInbox = () => {
    if (this.canNavigateTo(routeMap.Inbox)) {
      Router.Inbox();
    }
  };

  openSettings = () => {
    if (this.canNavigateTo(routeMap.Settings)) {
      Router.Settings();
    }
  };

  openKnowledgeBase = () => {
    if (this.canNavigateTo(routeMap.KnowledgeBase)) {
      Router.KnowledgeBase();
    }
  };

  render() {
    const {isVisible, isDisabled, uiTheme} = this.props;

    if (!isVisible) {
      return null;
    }

    const color = (routeName: string) => {
      return (
        isDisabled
          ? uiTheme.colors.$disabled
          : this.isActiveRoute(routeName) ? uiTheme.colors.$link : uiTheme.colors.$navigation
      );
    };

    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"

        testID="menu"
        style={styles.menu}
      >
        <MenuItem
          testID="menuIssues"
          icon={<IconTask
            testID="menuIssuesIcon"
            isActive={this.isActiveRoute(routeMap.Issues)}
            size={23}
            color={color(routeMap.Issues)}
          />}
          onPress={this.openIssueList}
        />

        <MenuItem
          testID="menuAgileBoards"
          icon={<IconBoard size={28} color={color(routeMap.AgileBoard)}/>}
          testId="pageAgileBoards"
          onPress={this.openAgileBoard}
        />

        <Feature version={FEATURES.inbox}>
          <MenuItem
            testID="menuNotifications"
            icon={<IconBell size={22} color={color(routeMap.Inbox)}/>}
            onPress={this.openInbox}
          />
        </Feature>

        <MenuItem
          testID="menuKnowledgeBase"
          icon={<IconKnowledgeBase size={22} color={color(routeMap.KnowledgeBase)}/>}
          onPress={this.openKnowledgeBase}
        />

        <MenuItem
          testID="menuSettings"
          icon={<IconSettings size={21} color={color(routeMap.Settings)}/>}
          onPress={this.openSettings}
        />

      </AnimatedView>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isVisible: state.app.auth && state.app.user,
    isDisabled: state.app.isChangingAccount
  };
};

export default connect(mapStateToProps, null)(Menu);

