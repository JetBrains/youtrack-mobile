/* @flow */

import type {UITheme} from '../../flow/Theme';

const light: UITheme = {
  dark: false,
  name: 'light',
  barStyle: 'dark-content',

  colors: {
    $background: '#FFF',
    $boxBackground: 'rgba(0, 0, 0, 0.04)',

    $error: '#dd0000',

    $text: '#000',
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
