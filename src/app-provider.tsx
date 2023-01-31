import React, {Component} from 'react';
import {StatusBar} from 'react-native';

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

import type {Theme, UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';

type State = { mode: string; } | undefined;

export default class AppProvider extends Component<void, State> {
  state: State;

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
            const uiTheme: UITheme = theme.uiTheme || DEFAULT_THEME;
            const flexStyle: Partial<ViewStyleProp> = {flex: 1};
            const backgroundStyle: Partial<ViewStyleProp> = {backgroundColor: uiTheme.colors.$background};
            return (
              <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                <StatusBar
                  backgroundColor={backgroundStyle.backgroundColor}
                  barStyle={uiTheme.barStyle}
                  translucent={true}
                />
                <SafeAreaView style={[flexStyle, backgroundStyle]}>
                  <ErrorBoundary>
                    <Host>
                      <Navigation/>
                      <UserAgreement/>
                      <DebugView
                        logsStyle={{
                          ...backgroundStyle,
                          textColor: uiTheme.colors.$text,
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
                  <Network/>
                </SafeAreaView>
              </SafeAreaProvider>
            );
          }}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );
  }
}
