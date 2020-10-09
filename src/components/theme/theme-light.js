/* @flow */

import type {UITheme} from '../../flow/Theme';

const light: UITheme = {
  dark: false,
  mode: 'ytlight',
  name: 'Light',
  barStyle: 'dark-content',
  androidSummaryFontWeight: '500',

  colors: {
    $action: 'rgba(0, 0, 0, 0.38)',

    $background: '#FFFFFF',
    $boxBackground: 'rgba(0, 0, 0, 0.04)',

    $error: '#dd0000',

    $text: '#000000',
    $textSecondary: '#CCC',
    $textButton: '#FFF',

    $link: '#FE0082',
    $linkLight: 'rgba(254, 0, 130, 0.3)',

    $disabled: '#e9e9e9',

    $icon: '#737577',
    $iconAccent: '#b8d1e5',

    $mask: '#00000057',
    $navigation: '#737577',

    $separator: '#dfe5eb'
  },
};

export default light;
