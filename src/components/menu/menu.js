/* @flow */

import React, {Component} from 'react';
import {View as AnimatedView} from 'react-native-animatable';
import Router from '../router/router';
import {connect} from 'react-redux';
import {MenuItem} from './menu__item';

import Feature from '../feature/feature';

import {IconBell, IconBoard, IconSettings, IconTask} from '../icon/icon';
import {DEFAULT_THEME} from '../theme/theme';
import {routeMap} from '../../app-routes';

import styles from './menu.styles';

import type {UITheme} from '../../flow/Theme';

type Props = {
  isVisible: boolean,
  isDisabled: boolean,
  uiTheme: UITheme
}

type State = {
  currentRouteName?: string | null
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
      currentRouteName: null
    };

    Router.setOnDispatchCallback((routeName) => {
      this.setCurrentRouteName(routeName);
    });
  }


  setCurrentRouteName = (routeName) => this.setState({
    currentRouteName: routeName
  });

  isActiveRoute = (routeName: string) => {
    const currentRouteName = this.state.currentRouteName;
    return currentRouteName === routeName;
  };

  canNavigateTo = (routeName: string) => {
    return !this.props.isDisabled && !this.isActiveRoute(routeName);
  };

  openIssueList = () => {
    if (this.canNavigateTo(routeMap.IssueList)) {
      Router.IssueList();
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
          isActive={this.isActiveRoute(routeMap.IssueList)}
          icon={<IconTask size={24} color={color(routeMap.IssueList)}/>}
          label={'Issues'}
          onPress={this.openIssueList}
        />

        <MenuItem
          isActive={this.isActiveRoute(routeMap.AgileBoard)}
          icon={<IconBoard size={28} color={color(routeMap.AgileBoard)}/>}
          label={'Agile Boards'}
          testId="pageAgileBoards"
          onPress={this.openAgileBoard}
        />

        <Feature version={'2018.3'}>
          <MenuItem
            isActive={this.isActiveRoute(routeMap.Inbox)}
            icon={<IconBell size={23} color={color(routeMap.Inbox)}/>}
            label={'Activity'}
            onPress={this.openInbox}
          />
        </Feature>

        <MenuItem
          isActive={this.isActiveRoute(routeMap.Settings)}
          icon={<IconSettings size={22} color={color(routeMap.Settings)}/>}
          label={'Settings'}
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

