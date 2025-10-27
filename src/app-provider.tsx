import React from 'react';
import {StatusBar} from 'react-native';

import {Host} from 'react-native-portalize';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {SafeAreaView, SafeAreaProvider, initialWindowMetrics} from 'react-native-safe-area-context';

import {KeyboardProvider} from 'react-native-keyboard-controller';

import LogsView from 'components/logs-view/logs-view';
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
import {getKeyboardMargin} from 'components/responsive/responsive-helper';
import {ThemeContext} from 'components/theme/theme-context';
import {menuHeight} from 'components/common-styles/header';

import type {Theme, UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';

const AppProvider = () => {
  const [mode, setMode] = React.useState<string | undefined>();

  React.useEffect(() => {
    const fetchThemeMode = async () => {
      const themeMode: string = await getThemeMode();
      buildStyles(themeMode, getUITheme(themeMode));
      setMode(themeMode);
    };
    fetchThemeMode();
  }, []);

  return !mode ? null : (
    <ThemeProvider mode={mode}>
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiTheme: UITheme = theme.uiTheme || DEFAULT_THEME;
          const flexStyle: Partial<ViewStyleProp> = {flex: 1};
          const backgroundStyle = {backgroundColor: uiTheme.colors.$background};
          return (
            <SafeAreaProvider initialMetrics={initialWindowMetrics}>
              <KeyboardProvider>
                <StatusBar
                  backgroundColor={backgroundStyle.backgroundColor}
                  barStyle={uiTheme.barStyle}
                  translucent={true}
                />
                <SafeAreaView
                  style={[flexStyle, backgroundStyle]}
                >
                  <KeyboardAvoidingView
                    behavior="padding"
                    keyboardVerticalOffset={(StatusBar.currentHeight || 0) - menuHeight - getKeyboardMargin()}
                    style={flexStyle}
                  >
                  <ErrorBoundary>
                    <Host>
                      <Navigation />
                      <UserAgreement />
                      <LogsView
                        logsStyle={{
                          ...backgroundStyle,
                          textColor: uiTheme.colors.$text,
                          separatorColor: uiTheme.colors.$separator,
                        }}
                      />
                    </Host>
                  </ErrorBoundary>
                  </KeyboardAvoidingView>
                  <Network />
                </SafeAreaView>
              </KeyboardProvider>
            </SafeAreaProvider>
          );
        }}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
};

export default AppProvider;
