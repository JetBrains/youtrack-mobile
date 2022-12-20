import {themeColorsPalette} from './theme-common';
import type {UITheme} from 'flow/Theme';
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
    $link: '#FF008C',
    $linkLight: 'rgba(254, 0, 130, 0.3)',
    $disabled: '#e9e9e9',
    $icon: '#737577',
    $iconAccent: '#b8d1e5',
    $mask: '#00000057',
    $navigation: '#737577',
    $separator: '#dfe5eb',
    ...themeColorsPalette,
  },
};
export default light;