/* @flow */

export type Theme = {
  mode: ?string,
  uiTheme: UITheme,
  setMode: (themeName: string, reset: boolean) => any
}

export type BarStyle = 'light-content' | 'dark-content';

export type UIThemeColors = {|
  $background: string,
  $boxBackground: string,

  $error: string,

  $text: string,
  $textSecondary: string,
  $textButton: string,

  $link: string,
  $linkLight: string,

  $disabled: string,

  $icon: string,
  $iconAccent: string,

  $mask: string,
  $navigation: string,

  $separator: string
|};

export type UITheme = {
  dark: boolean,
  mode: string,
  name: string,
  barStyle: BarStyle,

  colors: UIThemeColors
}

