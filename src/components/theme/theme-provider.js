/* @flow */

import React, {PureComponent} from 'react';
import {StyleSheet} from 'react-native';

import {Appearance, AppearanceProvider} from 'react-native-appearance';
import memoize from 'memoizee';

import {ThemeContext} from './theme-context';
import {getSystemMode, getUITheme} from './theme';
import {getComponentDisplayName} from '../../util/util';

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
      this.setState({
        mode: colorScheme,
        uiTheme: getUITheme(colorScheme)
      });
    }
  };

  createStylesheet = (stylesGetter: (uiTheme: UITheme) => Object) => {
    const styles = stylesGetter(this.state.uiTheme);
    return StyleSheet.create(styles);
  };

  createStyles = memoize(this.createStylesheet, {
    normalizer: (args: Array<Object | string>) => {
      const id = `${getComponentDisplayName(args[1])}-theme-${this.state.mode}`;
      return id || JSON.stringify(args[0]);
    }
  });

  render() {
    return (
      <ThemeContext.Provider
        value={{
          mode: this.state.mode,
          uiTheme: this.state.uiTheme,
          setMode: this.setMode,
          createStyles: this.createStyles
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
