import {Appearance} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import darkTheme from './theme-dark';
import lightTheme from './theme-light';
import {THEME_MODE_KEY} from '../storage/storage';
import type {UITheme} from 'types/Theme';
export const DEFAULT_THEME: UITheme = lightTheme;
export const getSystemThemeMode = (): any => Appearance.getColorScheme();
export const themes: UITheme[] = [lightTheme, darkTheme];
export const getUITheme = (mode: string): UITheme => {
  const theme: UITheme | null | undefined = themes.reduce(
    (theme: UITheme | null | undefined, it: UITheme) =>
      it.mode.includes(mode) ? it : theme,
    null,
  );
  return theme || DEFAULT_THEME;
};
export const buildStyles = (mode: string, uiTheme: UITheme) => {
  EStyleSheet.build({
    $theme: mode,
    $androidSummaryFontWeight: uiTheme.androidSummaryFontWeight,
    $link: uiTheme.colors.$link,
    $resolved: uiTheme.colors.$icon,
    $disabled: uiTheme.colors.$disabled,
    $icon: uiTheme.colors.$icon,
    ...uiTheme.colors,
  });
};
export const getThemeMode = async (): Promise<string> => {
  let mode: string;

  try {
    const storedMode: string | null | undefined = JSON.parse(
      await AsyncStorage.getItem(THEME_MODE_KEY),
    );
    mode = storedMode || getSystemThemeMode();
  } catch (e) {
    mode = DEFAULT_THEME.mode;
  }

  return mode;
};
