import {themeColorsPalette} from './theme-common';
import type {UITheme} from 'types/Theme';
const dark: UITheme = {
  dark: true,
  mode: 'ytdark',
  name: 'dark',
  barStyle: 'light-content',
  androidSummaryFontWeight: '400',
  colors: {
    $background: '#1c1c1e',
    $boxBackground: 'rgb(35, 39, 43)',
    $dimBackground: 'rgba(0,0,0,0.7)',
    $error: 'rgb(219, 88, 96)',
    $text: 'rgb(187, 187, 187)',
    $textSecondary: 'rgb(115, 117, 119)',
    $textButton: '#FFFFFF',
    $link: 'rgba(15, 91, 153, 1)',
    $linkLight: 'rgba(0, 142, 255, 0.3)',
    $disabled: '#5d5d5d',
    $icon: 'rgb(153, 153, 153)',
    $iconAccent: '#577996',
    $mask: '#FFFFFF57',
    $navigation: '#696969',
    $separator: 'rgba(210, 254, 254, 0.15)',
    ...themeColorsPalette,
  },
};
export default dark;
