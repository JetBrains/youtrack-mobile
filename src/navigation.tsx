/* @flow */

import React, {PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';

import Menu from 'components/menu/menu';
import Router from 'components/router/router';
import {menuHeight} from 'components/common-styles/header';
import {routeMap} from './app-routes';
import {ThemeContext} from 'components/theme/theme-context';

import type {Node} from 'react';
import type {Theme} from 'flow/Theme';

const styles = StyleSheet.create({
  flexBox: {
    flex: 1,
  },
  view: {
    flexGrow: 1,
  },
  navigation: {
    height: menuHeight,
  },
  navigationHidden: {
    position: 'absolute',
    bottom: -100,
  },
});

type State = {
  isMenuShown: boolean,
};

export default class Navigation extends PureComponent<{}, State> {
  state: State = {
    isMenuShown: false,
  };

  render(): Node {
    const onRoute = (currentRoute) => {
      const isMenuShown = (
        currentRoute.routeName !== routeMap.Home &&
        currentRoute.routeName !== routeMap.EnterServer &&
        currentRoute.routeName !== routeMap.LogIn &&
        currentRoute.routeName !== routeMap.PreviewFile &&
        currentRoute.routeName !== routeMap.AttachmentPreview &&
        currentRoute.routeName !== routeMap.CreateIssue &&
        currentRoute.routeName !== routeMap.WikiPage
      );
      this.setState({isMenuShown});
    };

    return (
      <View style={styles.flexBox}>

        <View style={styles.view}>
          {Router.renderNavigatorView(onRoute)}
        </View>

        <View
          style={[
            styles.navigation,
            this.state.isMenuShown ? null : styles.navigationHidden,
          ]}>

          <ThemeContext.Consumer>
            {(theme: Theme) => <Menu/>}
          </ThemeContext.Consumer>
        </View>

      </View>
    );
  }
}
