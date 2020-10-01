/* @flow */

import {Appearance} from 'react-native-appearance';
import EStyleSheet from 'react-native-extended-stylesheet';

import lightTheme from './theme-light';
import darkTheme from './theme-dark';

import type {UITheme} from '../../flow/Theme';

export const DEFAULT_THEME: UITheme = lightTheme;
export const DEFAULT_MODE: string = lightTheme.name;

export const getSystemMode = (): string => Appearance.getColorScheme() || DEFAULT_MODE;
export const DEFAULT_SYSTEM_MODE: string = getSystemMode();

export const getUITheme = (themeName: string): UITheme => {
  if ([lightTheme.name, darkTheme.name].includes(themeName)) {
    return themeName === DEFAULT_MODE ? lightTheme : darkTheme;
  }
  return DEFAULT_THEME;
};

export const buildStyles = (mode: string = DEFAULT_SYSTEM_MODE, uiTheme: UITheme = DEFAULT_THEME) => {
  EStyleSheet.build({
    $theme: mode,
    $resolved: uiTheme.colors.$icon,
    $shadowColor: uiTheme.colors.$icon,
    $link: uiTheme.colors.$link,
    $iconAccent: uiTheme.colors.$iconAccent,
    $background: uiTheme.colors.$background,
    ...uiTheme.colors
  });
};

