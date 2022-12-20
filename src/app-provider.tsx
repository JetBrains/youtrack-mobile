import React, {Component} from 'react';
import {StatusBar} from 'react-native';
// @ts-expect-error: cannot typecheck easy-toast module because of mistakes there
import Toast from 'react-native-easy-toast';
import {Host} from 'react-native-portalize';
import {
  SafeAreaView,
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import DebugView from 'components/debug-view/debug-view';
import ErrorBoundary from 'components/error-boundary/error-boundary';
import Navigation from './navigation';
import Network from './components/network/network';
import ThemeProvider from 'components/theme/theme-provider';
import UserAgreement from 'components/user-agreement/user-agreement';
import {
  buildStyles,
  DEFAULT_THEME,
  getUITheme,
  getThemeMode,
} from 'components/theme/theme';
import {setNotificationComponent} from 'components/notification/notification';
import {ThemeContext} from 'components/theme/theme-context';
import type {Theme} from 'flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
export default class AppProvider extends Component<
  {},
  {
    mode: string;
  }
> {
  state: {
    mode: string;
  };

  async UNSAFE_componentWillMount() {
    const themeMode: string = await getThemeMode();
    buildStyles(themeMode, getUITheme(themeMode));
    this.setState({
      mode: themeMode,
    });
  }

  render(): React.ReactNode {
    if (!this?.state?.mode) {
      return null;
    }

    return (
      <ThemeProvider mode={this.state.mode}>
        <ThemeContext.Consumer>
          {(theme: Theme) => {
            const uiTheme = theme.uiTheme || DEFAULT_THEME;
            const backgroundColor = uiTheme.colors.$background;
            const style: ViewStyleProp = {
              flex: 1,
              backgroundColor: backgroundColor,
            };
            return (
              <SafeAreaProvider initialSafeAreaInsets={initialWindowMetrics}>
                <StatusBar
                  backgroundColor={backgroundColor}
                  barStyle={uiTheme.barStyle}
                  translucent={true}
                />
                <SafeAreaView style={style}>
                  <ErrorBoundary>
                    <Host>
                      <Navigation />
                      <UserAgreement />
                      <DebugView
                        logsStyle={{
                          textColor: uiTheme.colors.$text,
                          backgroundColor,
                          separatorColor: uiTheme.colors.$separator,
                        }}
                      />
                    </Host>
                  </ErrorBoundary>

                  <Toast
                    ref={toast =>
                      toast ? setNotificationComponent(toast) : null
                    }
                  />
                  <Network />
                </SafeAreaView>
              </SafeAreaProvider>
            );
          }}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );
  }
}
