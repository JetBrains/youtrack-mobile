/* @flow */

import type {UITheme} from '../../flow/Theme';

const dark: UITheme = {
  dark: true,
  name: 'dark',
  barStyle: 'light-content',

  colors: {
    background: '#000',

    text: '#FFF',
    textSecondary: '#CCC',

    link: '#FE0082',
    disabled: '#DFE5EB',
    border: '#888888',

    icon: '#737577',
    iconAccent: '#b8d1e5',

    placeholder: '#717171',
    placeholderActive: '#80929D',

    mask: '#00000057',
  },
};

export default dark;
