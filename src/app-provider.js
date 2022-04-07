/* @flow */

import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';

import NetworkPopup from './components/network/network-popup';
// $FlowFixMe: cannot typecheck easy-toast module because of mistakes there
import Toast from 'react-native-easy-toast';
import {Host} from 'react-native-portalize';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import DebugView from 'components/debug-view/debug-view';
import ErrorBoundary from 'components/error-boundary/error-boundary';
import Navigation from './navigation';
import ThemeProvider from 'components/theme/theme-provider';
import UserAgreement from 'components/user-agreement/user-agreement';
import {buildStyles, DEFAULT_THEME, getThemeMode, getUITheme} from 'components/theme/theme';
import {setNotificationComponent} from 'components/notification/notification';
import {ThemeContext} from 'components/theme/theme-context';

import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


export default function AppProvider(): Node {
  const [themeMode, updateThemeMode] = useState('');

  const init = async () => {
    const _themeMode: string = await getThemeMode();
    updateThemeMode(_themeMode);
    buildStyles(_themeMode, getUITheme(_themeMode));
  };

  useEffect(() => {
    init();
  }, []);


  if (!themeMode) {
    return null;
  }
  return (
    <ThemeProvider mode={themeMode}>
      <ThemeContext.Consumer>
        {
          ((theme: Theme) => {
            const uiTheme = theme.uiTheme || DEFAULT_THEME;
            const backgroundColor = uiTheme.colors.$background;
            const style: ViewStyleProp = {
              flex: 1,
              backgroundColor,
            };

            return (
              <SafeAreaProvider>
                <StatusBar
                  backgroundColor={backgroundColor}
                  barStyle={uiTheme.barStyle}
                  translucent={true}
                />
                <SafeAreaView
                  style={style}>
                  <ErrorBoundary>
                    <Host>
                      <Navigation/>
                      <UserAgreement/>
                      <DebugView
                        logsStyle={{
                          textColor: uiTheme.colors.$text,
                          backgroundColor,
                          separatorColor: uiTheme.colors.$separator,
                        }}
                      />
                    </Host>
                  </ErrorBoundary>

                  <Toast ref={toast => toast ? setNotificationComponent(toast) : null}/>
                  <NetworkPopup/>

                </SafeAreaView>
              </SafeAreaProvider>
            );
          })
        }
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}
