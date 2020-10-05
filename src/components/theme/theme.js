/* @flow */

import {Appearance} from 'react-native-appearance';
import EStyleSheet from 'react-native-extended-stylesheet';

import lightTheme from './theme-light';
import darkTheme from './theme-dark';

import type {UITheme} from '../../flow/Theme';

export const DEFAULT_THEME: UITheme = lightTheme;
export const getSystemThemeMode = () => Appearance.getColorScheme();
export const themes: Array<UITheme> = [lightTheme, darkTheme];

export const getUITheme = (mode: string): UITheme => {
  const theme: ?UITheme = themes.reduce((theme: ?UITheme, it: UITheme) => it.mode.includes(mode) ? it : theme, null);
  return theme || DEFAULT_THEME;
};

export const buildStyles = (mode: string, uiTheme: UITheme) => {
  EStyleSheet.build({
    $theme: mode,
    $link: uiTheme.colors.$link,
    $resolved: uiTheme.colors.$icon,
    $disabled: uiTheme.colors.$disabled,
    $icon: uiTheme.colors.$icon,
    ...uiTheme.colors
  });
};

