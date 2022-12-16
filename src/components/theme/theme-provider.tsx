/* @flow */

import {Appearance} from 'react-native';
import React, {PureComponent} from 'react';

import DeviceInfo from 'react-native-device-info';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import {flushStoragePart, getStorageState} from '../storage/storage';
import {isAndroidPlatform} from 'util/util';

import {ThemeContext} from './theme-context';
import {buildStyles, getSystemThemeMode, getUITheme, themes} from './theme';

import type {Node} from 'react';
import type {UITheme} from 'flow/Theme';

type State = {
  mode: ?string,
  uiTheme: UITheme
};

type Props = {
  children: any,
  mode: ?string
};

const isAndroid: boolean = isAndroidPlatform();

class ManageThemeProvider extends PureComponent<Props, State> {
  _isMounted = false;
  subscription = () => {};
  canChangeAndroidNavBar = false;

  constructor(props: Props) {
    super(props);

    this.canChangeAndroidNavBar = this.canStyleAndroidNavBar();
    const _mode = props.mode || getSystemThemeMode();
    const uiTheme:UITheme = getUITheme(_mode);
    this.setAndroidNavBarStyle(uiTheme);
    this.state = {
      mode: _mode,
      uiTheme: uiTheme,
    };
  }

  canStyleAndroidNavBar = (): boolean => {
    if (!isAndroid) {
      return false;
    }

    let androidVersion: number;
    const systemVersion: string = DeviceInfo.getSystemVersion();
    try {
      androidVersion = Number(systemVersion);
    } catch (error) {
      androidVersion = parseFloat(systemVersion);
    }
    return typeof androidVersion === 'number' && androidVersion >= 8;
  };

  componentDidMount = () => {
    this._isMounted = true;
    this.subscription = Appearance.addChangeListener(
      (settings: { colorScheme: string }) => {
        this.setMode(settings.colorScheme);
      }
    );
  };

  componentWillUnmount() {
    this.subscription.remove();
    this._isMounted = false;
  }

  buildStyles(mode: ?string): UITheme {
    const _mode = mode || getSystemThemeMode();
    const uiTheme = getUITheme(_mode);
    buildStyles(_mode, uiTheme);
    return uiTheme;
  }

  isCustomMode(mode: ?string): boolean {
    return themes.some((theme: UITheme) => theme.mode === mode);
  }

  shouldChangeMode(mode: string = ''): boolean {
    const storedThemeName: ?string = getStorageState().themeMode;
    const customMode: boolean = this.isCustomMode(mode);
    return customMode || !storedThemeName || (!customMode && !!storedThemeName);
  }

  setAndroidNavBarStyle(uiTheme: UITheme) {
    if (this.canChangeAndroidNavBar) {
      try {
        changeNavigationBarColor(uiTheme.colors.$background, !uiTheme.dark, false);
      } catch (e) {
        //
      }
    }
  }

  setMode = async (mode: ?string, reset: boolean = false) => {
    if (this._isMounted) {
      const cm = this.isCustomMode(mode);
      const storedMode = getStorageState().themeMode;

      let newMode = null;
      if (cm === true) {
        newMode = mode;
      } else if (reset) {
        newMode = null;
      } else if (storedMode) {
        newMode = storedMode;
      }
      await flushStoragePart({themeMode: newMode});
      const uiTheme: UITheme = this.buildStyles(newMode);
      this.setState({
        mode,
        uiTheme: uiTheme,
      });

      this.setAndroidNavBarStyle(uiTheme);
    }
  };

  render() {
    return (
      <ThemeContext.Provider
        value={{
          mode: this.state.mode,
          uiTheme: this.state.uiTheme,
          setMode: this.setMode,
        }}
      >
        {this.props.children}
      </ThemeContext.Provider>
    );
  }

}

const ThemeProvider = (props: {children: any, mode: string}): Node => (
  <ManageThemeProvider mode={props.mode}>{props.children}</ManageThemeProvider>
);

export default ThemeProvider;
