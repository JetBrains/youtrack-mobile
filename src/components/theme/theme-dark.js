/* @flow */

import type {UITheme} from '../../flow/Theme';

const dark: UITheme = {
  dark: true,
  mode: 'ytdark',
  name: 'dark',
  barStyle: 'light-content',
  androidSummaryFontWeight: '400',

  colors: {
    $background: '#1c1c1e',
    $boxBackground: '#2c2c2e',

    $error: '#ee0e0e',

    $text: '#e1e1e1',
    $textSecondary: '#b0b0b0',
    $textButton: '#FFFFFF',

    $link: '#FF008C',
    $linkLight: 'rgba(254, 0, 130, 0.3)',

    $disabled: '#5d5d5d',

    $icon: '#9f9f9f',
    $iconAccent: '#b8d1e5',

    $mask: '#FFFFFF57',
    $navigation: '#696969',

    $separator: 'rgba(210, 254, 254, 0.15)'
  }
};

export default dark;
