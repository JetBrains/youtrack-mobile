/* @flow */

import type {UITheme} from '../../flow/Theme';

const dark: UITheme = {
  dark: true,
  name: 'dark',
  barStyle: 'light-content',

  colors: {
    $background: '#1c1c1e',
    $boxBackground: '#2c2c2e',

    $error: '#ee0e0e',

    $text: '#FFF',
    $textSecondary: '#b0b0b0',
    $textButton: '#FFF',

    $link: '#FE0082',
    $linkLight: 'rgba(254, 0, 130, 0.3)',

    $disabled: '#5d5d5d',
    $border: '#888888',

    $icon: '#a5a5a5',
    $iconAccent: '#b8d1e5',

    $mask: '#FFFFFF57',

    $separator: '#3e3e3e'
  },
};

export default dark;
