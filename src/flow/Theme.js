/* @flow */

export type Theme = {
  mode: string,
  uiTheme: UITheme
}

export type BarStyle = 'light-content' | 'dark-content';

export type UITheme = {
  dark: boolean,
  name: string,
  barStyle: BarStyle,

  colors: {|
    $background: string,
    $boxBackground: string,

    $text: string,
    $textSecondary: string,

    $link: string,
    $disabled: string,
    $border: string,

    $icon: string,
    $iconAccent: string,

    $mask: string,

    $separatorOpacity: number
  |}
}

