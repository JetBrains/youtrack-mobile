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
    $error: '#C22731',
    $text: '#000000',
    $textSecondary: '#CCC',
    $textButton: '#FFF',
    $link: '#008EFF',
    $linkLight: 'rgba(0, 142, 255, 0.3)',
    $disabled: '#e9e9e9',
    $icon: '#999999',
    $iconAccent: '#b8d1e5',
    $mask: '#00000057',
    $navigation: '#737577',
    $separator: '#dfe5eb',
    ...themeColorsPalette,
  },
};
export default light;
