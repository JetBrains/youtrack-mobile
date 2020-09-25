/* @flow */

import React from 'react';

import {DEFAULT_SYSTEM_MODE, DEFAULT_THEME} from './theme';

import type {Theme} from '../../flow/Theme';

export const ThemeContext = React.createContext<Theme>({
  mode: DEFAULT_SYSTEM_MODE,
  uiTheme: DEFAULT_THEME,
  setMode: () => {},
  createStyles: () => {}
});
