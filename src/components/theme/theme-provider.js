/* @flow */

import React, {PureComponent} from 'react';
import {StyleSheet} from 'react-native';

import {Appearance, AppearanceProvider} from 'react-native-appearance';

import {flushStoragePart, getStorageState} from '../storage/storage';

import {ThemeContext} from './theme-context';
import {buildStyles, getSystemThemeMode, getUITheme, themes} from './theme';

import type {UITheme} from '../../flow/Theme';

type State = {
  mode: ?string,
  uiTheme: UITheme
};

type Props = {
  children: any,
  mode: ?string
};

class ManageThemeProvider extends PureComponent<Props, State> {
  _isMounted = false;
  subscription = () => {};

  constructor(props: Props) {
    super(props);
    const _mode = props.mode || getSystemThemeMode();
    this.state = {
      mode: _mode,
      uiTheme: getUITheme(_mode)
    };
  }

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

  getMode() {

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
      this.setState({
        mode,
        uiTheme: this.buildStyles(newMode)
      });
    }
  };

  createStylesheet = (stylesGetter: (uiTheme: UITheme) => Object) => {
    const styles = stylesGetter(this.state.uiTheme);
    return StyleSheet.create(styles);
  };

  render() {
    return (
      <ThemeContext.Provider
        value={{
          mode: this.state.mode,
          uiTheme: this.state.uiTheme,
          setMode: this.setMode
        }}
      >
        {this.props.children}
      </ThemeContext.Provider>
    );
  }

}

const ThemeProvider = (props: {children: any, mode: string}) => (
  <AppearanceProvider>
    <ManageThemeProvider mode={props.mode}>{props.children}</ManageThemeProvider>
  </AppearanceProvider>
);

export default ThemeProvider;
