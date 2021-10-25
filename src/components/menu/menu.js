/* @flow */

import React, {Component} from 'react';
import {View as AnimatedView} from 'react-native-animatable';
import {connect} from 'react-redux';

import Feature, {FEATURE_VERSION} from '../feature/feature';
import Router from '../router/router';
import {DEFAULT_THEME} from '../theme/theme';
import {getStorageState} from '../storage/storage';
import {IconBell, IconBoard, IconSettings, IconTask, IconKnowledgeBase} from '../icon/icon';
import {MenuItem} from './menu__item';
import {routeMap} from '../../app-routes';

import styles from './menu.styles';

import type {Article} from '../../flow/Article';
import type {UITheme} from '../../flow/Theme';

type Props = {
  isVisible: boolean,
  isDisabled: boolean,
  lastVisitedArticle?: Article,
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
    uiTheme: DEFAULT_THEME,
  };

  unsubscribeOnDispatch: Function;

  constructor() {
    super();

    this.state = {
      prevRouteName: null,
      currentRouteName: null,
    };

    this.unsubscribeOnDispatch = Router.setOnDispatchCallback((routeName: ?string, prevRouteName: ?string) => {
      this.setCurrentRouteName(routeName, prevRouteName);
    });
  }

  componentWillUnmount() {
    this.unsubscribeOnDispatch();
  }

  setCurrentRouteName = (routeName: ?string, prevRouteName: ?string) => this.setState({
    prevRouteName: prevRouteName,
    currentRouteName: routeName,
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

    if (this.state.currentRouteName === routeMap.ArticleSingle) {
      return routeMap.KnowledgeBase === routeName;
    }

    if (this.state.currentRouteName === routeMap.ArticleCreate) {
      return routeMap.KnowledgeBase === routeName;
    }

    if (this.state.currentRouteName === routeMap.Page) {
      return routeMap.KnowledgeBase === routeName && (
        this.state.prevRouteName === routeMap.Article ||
        this.state.prevRouteName === routeMap.KnowledgeBase ||
        this.state.prevRouteName === routeMap.PageModal
      );
    }

    if (this.state.currentRouteName === routeMap.PageModal) {
      return routeMap.KnowledgeBase === routeName && (
        this.state.prevRouteName === routeMap.Article ||
        this.state.prevRouteName === routeMap.Page
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
      this.state.currentRouteName === routeMap.Article ||
      this.state.currentRouteName === routeMap.ArticleSingle
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
    const isNotArticleView: boolean = (
      this.state.currentRouteName !== routeMap.ArticleSingle &&
      this.state.currentRouteName !== routeMap.Article
    );
    if (this.canNavigateTo(routeMap.KnowledgeBase)) {
      const articleLastVisited = getStorageState().articleLastVisited;
      const article: ?Article = articleLastVisited && articleLastVisited.article;
      if (article && isNotArticleView) {
        Router.ArticleSingle({articlePlaceholder: article});
      } else {
        Router.KnowledgeBase();
      }
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
          testId="menuIssues"
          icon={<IconTask
            testID="menuIssuesIcon"
            isActive={this.isActiveRoute(routeMap.Issues)}
            size={23}
            color={color(routeMap.Issues)}
          />}
          onPress={this.openIssueList}
        />

        <MenuItem
          testId="test:id/menuAgile"
          icon={<IconBoard size={28} color={color(routeMap.AgileBoard)}/>}
          onPress={this.openAgileBoard}
        />

        <Feature version={FEATURE_VERSION.inbox}>
          <MenuItem
            testId="test:id/menuNotifications"
            icon={<IconBell size={22} color={color(routeMap.Inbox)}/>}
            onPress={this.openInbox}
          />
        </Feature>

        <Feature version={FEATURE_VERSION.knowledgeBase}>
          <MenuItem
            testID="test:id/menuKnowledgeBase"
            icon={<IconKnowledgeBase size={22} color={color(routeMap.KnowledgeBase)}/>}
            onPress={this.openKnowledgeBase}
          />
        </Feature>
        <MenuItem
          testId="test:id/menuSettings"
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
    isDisabled: state.app.isChangingAccount,
  };
};

export default (connect(mapStateToProps, null)(Menu): any);

