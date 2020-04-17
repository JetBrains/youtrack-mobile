/* @flow */

import {Dimensions, StyleSheet} from 'react-native';
import React, {Component} from 'react';
import {View as AnimatedView} from 'react-native-animatable';
import Router from '../router/router';
import {connect} from 'react-redux';
import {MenuItem} from './menu__item';

import Feature from '../feature/feature';
import {menuHeight} from '../common-styles/navigation';

import {IconBell, IconCheckMarked, IconCog, IconPause} from '../icon/icon';
import {COLOR_FONT_ON_BLACK, COLOR_GRAY, COLOR_ICON_MEDIUM_GREY, COLOR_PINK} from '../variables/variables';

import {elevationTop} from '../common-styles/form';
import {routeMap} from '../../app-routes';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  isVisible: boolean,
  isDisabled: boolean,
  style?: ViewStyleProp
}

type State = {
  currentRouteName?: string | null
}

const styles = StyleSheet.create({
  menu: {
    height: menuHeight,
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLOR_FONT_ON_BLACK,
    ...elevationTop
  }
});


class Menu extends Component<Props, State> {
  static defaultProps: Props = {
    isVisible: false,
    isDisabled: false,
  };

  constructor() {
    super();

    this.state = {
      currentRouteName: null
    };

    Router.setOnDispatchCallback((routeName) => {
      this.setState({currentRouteName: routeName});
    });
  }


  setCurrentRouteName = (routeName) => this.setState({
    currentRouteName: routeName
  });

  isCurrentRoute = (routeName: string) => {
    return this.state.currentRouteName === routeName;
  };

  canNavigateTo = (routeName: string) => {
    return !this.props.isDisabled && !this.isCurrentRoute(routeName);
  };

  openIssueList = () => {
    if (this.canNavigateTo(routeMap.IssueList)) {
      Router.IssueList();
      this.setCurrentRouteName(routeMap.IssueList);
    }
  };

  openAgileBoard = () => {
    if (this.canNavigateTo(routeMap.AgileBoard)) {
      this.setCurrentRouteName(routeMap.AgileBoard);
      Router.AgileBoard();
    }
  };

  openInbox = () => {
    if (this.canNavigateTo(routeMap.Inbox)) {
      this.setCurrentRouteName(routeMap.Inbox);
      Router.Inbox();
    }
  };

  openSettings = () => {
    if (this.canNavigateTo(routeMap.Settings)) {
      this.setCurrentRouteName(routeMap.Settings);
      Router.Settings();
    }
  };

  render() {
    const {style, isVisible, isDisabled} = this.props;

    if (!isVisible) {
      return null;
    }

    const color = (routeName: string) => {
      return (
        isDisabled
          ? COLOR_GRAY
          : this.isCurrentRoute(routeName) ? COLOR_PINK : COLOR_ICON_MEDIUM_GREY
      );
    };

    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"

        testID="menu"
        style={[
          styles.menu,
          {width: Dimensions.get('window').width},
          style
        ]}
      >
        <MenuItem
          isActive={this.isCurrentRoute(routeMap.IssueList)}
          icon={<IconCheckMarked style={{maxHeight: 22}} size={24} color={color(routeMap.IssueList)}/>}
          label={'Issues'}
          onPress={this.openIssueList}
        />

        <MenuItem
          isActive={this.isCurrentRoute(routeMap.AgileBoard)}
          icon={<IconPause size={20} color={color(routeMap.AgileBoard)}/>}
          label={'Agile Boards'}
          testId="pageAgileBoards"
          onPress={this.openAgileBoard}
        />

        <Feature version={'2018.3'}>
          <MenuItem
            isActive={this.isCurrentRoute(routeMap.Inbox)}
            icon={<IconBell size={22} color={color(routeMap.Inbox)}/>}
            label={'Notifications'}
            onPress={this.openInbox}
          />
        </Feature>

        <MenuItem
          isActive={this.isCurrentRoute(routeMap.Settings)}
          icon={<IconCog size={22} color={color(routeMap.Settings)}/>}
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

