/* @flow */

import {Appearance} from 'react-native-appearance';

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

