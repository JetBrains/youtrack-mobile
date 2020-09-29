/* @flow */

import React, {PureComponent} from 'react';
import {StyleSheet} from 'react-native';

import {Appearance, AppearanceProvider} from 'react-native-appearance';

import {ThemeContext} from './theme-context';
import {buildStyles, getSystemMode, getUITheme} from './theme';

import type {UITheme} from '../../flow/Theme';

type State = {
  mode: string,
  uiTheme: UITheme
};

type Props = {
  children: any
};

class ManageThemeProvider extends PureComponent<Props, State> {
  _isMounted = false;

  constructor() {
    super();
    const systemMode: string = getSystemMode();
    this.state = {
      mode: systemMode,
      uiTheme: getUITheme(systemMode)
    };
  }

  subscription = () => {};

  componentDidMount = () => {
    this._isMounted = true;
    this.subscription = Appearance.addChangeListener(
      (settings: { colorScheme: string }) => this.setMode(settings.colorScheme)
    );
  };

  componentWillUnmount() {
    this.subscription.remove();
    this._isMounted = false;
  }

  setMode = (colorScheme) => {
    if (this._isMounted) {
      const uiTheme = getUITheme(colorScheme);
      buildStyles(colorScheme, uiTheme);

      this.setState({
        mode: colorScheme,
        uiTheme: uiTheme
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

const ThemeProvider = (props: {children: any}) => (
  <AppearanceProvider>
    <ManageThemeProvider>{props.children}</ManageThemeProvider>
  </AppearanceProvider>
);

export default ThemeProvider;
