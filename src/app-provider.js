/* @flow */

import React, {Component} from 'react';
import {StatusBar, Platform, SafeAreaView} from 'react-native';

import ThemeProvider from './components/theme/theme-provider';
import {ThemeContext} from './components/theme/theme-context';

import DebugView from './components/debug-view/debug-view';
import UserAgreement from './components/user-agreement/user-agreement';
import {setNotificationComponent} from './components/notification/notification';


import ErrorBoundary from './components/error-boundary/error-boundary';
// $FlowFixMe: cannot typecheck easy-toast module because of mistakes there
import Toast from 'react-native-easy-toast';

import Navigation from './navigation';
import {buildStyles, DEFAULT_THEME, getUITheme, getThemeMode} from './components/theme/theme';


import type {Theme} from './flow/Theme';

export default class AppProvider extends Component<{ }, { mode: string }> {
  state = {};

  async UNSAFE_componentWillMount() {
    const themeMode: string = await getThemeMode();
    buildStyles(themeMode, getUITheme(themeMode));
    this.setState({mode: themeMode});
  }

  render() {
    if (this.state.mode === undefined) {
      return null;
    }

    return (
      <ThemeProvider mode={this.state.mode}>
        <ThemeContext.Consumer>
          {
            ((theme: Theme) => {
              const uiTheme = theme.uiTheme || DEFAULT_THEME;
              const backgroundColor = uiTheme.colors.$background;

              return (
                <SafeAreaView
                  style={{
                    flex: 1,
                    backgroundColor: backgroundColor,
                    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
                  }}>
                  <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle={uiTheme.barStyle}
                    translucent={true}
                  />
                  <ErrorBoundary>
                    <Navigation/>
                    <UserAgreement/>
                    <DebugView/>
                  </ErrorBoundary>

                  <Toast ref={toast => toast ? setNotificationComponent(toast) : null}/>

                </SafeAreaView>
              );
            })
          }
        </ThemeContext.Consumer>
      </ThemeProvider>
    );
  }
}
