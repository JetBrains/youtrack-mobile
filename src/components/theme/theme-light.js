/* @flow */

import type {UITheme} from '../../flow/Theme';

const light: UITheme = {
  dark: false,
  name: 'light',
  barStyle: 'dark-content',

  colors: {
    $background: '#FFF',
    $boxBackground: 'rgba(0, 0, 0, 0.04)',

    $text: '#000',
    $textSecondary: '#CCC',

    $link: '#FE0082',
    $disabled: '#DFE5EB',
    $border: '#888888',

    $icon: '#737577',
    $iconAccent: '#b8d1e5',

    $mask: '#00000057',

    $separatorOpacity: 0.5,
  },
};

export default light;
