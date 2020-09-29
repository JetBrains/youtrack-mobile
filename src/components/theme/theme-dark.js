/* @flow */

import type {UITheme} from '../../flow/Theme';

const dark: UITheme = {
  dark: true,
  name: 'dark',
  barStyle: 'light-content',

  colors: {
    $background: '#1c1c1e',
    $boxBackground: '#2c2c2e',

    $text: '#FFF',
    $textSecondary: '#CCC',

    $link: '#FE0082',
    $disabled: '#DFE5EB',
    $border: '#888888',

    $icon: '#737577',
    $iconAccent: '#b8d1e5',

    $mask: '#00000057',

    $separatorOpacity: 0.2,
  },
};

export default dark;
