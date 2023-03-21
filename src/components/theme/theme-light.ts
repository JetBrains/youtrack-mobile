import {themeColorsPalette} from './theme-common';
import type {UITheme} from 'types/Theme';
const light: UITheme = {
  dark: false,
  mode: 'ytlight',
  name: 'light',
  barStyle: 'dark-content',
  androidSummaryFontWeight: '400',
  colors: {
    $background: '#FFFFFF',
    $boxBackground: '#F7F9FA',
    $dimBackground: 'rgba(0,0,0,0.4)',
    $error: '#A90F1A',
    $text: '#1F2326',
    $textSecondary: '#737577',
    $textButton: '#FFF',
    $link: 'rgba(15, 91, 153, 1)',
    $linkLight: 'rgba(0, 142, 255, 0.3)',
    $disabled: '#e9e9e9',
    $icon: 'rgb(153, 153, 153)',
    $iconAccent: '#b8d1e5',
    $mask: '#00000057',
    $navigation: '#737577',
    $separator: '#dfe5eb',
    ...themeColorsPalette,
  },
};
export default light;
