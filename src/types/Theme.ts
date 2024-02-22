export type Theme = {
  mode: string | null | undefined;
  uiTheme: UITheme;
  setMode: (themeName: string, reset: boolean) => any;
};
export type BarStyle = 'light-content' | 'dark-content';
type UIThemeCommonColors = {
  $background: string;
  $boxBackground: string;
  $dimBackground: string;
  $error: string;
  $text: string;
  $textSecondary: string;
  $textButton: string;
  $link: string;
  $linkLight: string;
  $disabled: string;
  $icon: string;
  $iconAction: string;
  $iconBackground: string;
  $iconAccent: string;
  $mask: string;
  $navigation: string;
  $separator: string;
  $private: string;
  $privateBackground: string;
};
export type UIThemeColorsPaletteColors = {
  $greyBackground: string;
  $greyColor: string;
  $redBackground: string;
  $redColor: string;
  $yellowBackground: string;
  $yellowColor: string;
  $greenBackground: string;
  $greenColor: string;
  $blueBackground: string;
  $blueColor: string;
};
export type UIThemeColors = UIThemeCommonColors & UIThemeColorsPaletteColors;
export type UIThemeName = 'light' | 'dark';
export type UITheme = {
  dark: boolean;
  mode: string;
  name: UIThemeName;
  barStyle: BarStyle;
  androidSummaryFontWeight: string;
  colors: UIThemeColors;
};
