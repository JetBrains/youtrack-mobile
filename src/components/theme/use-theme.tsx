import React from 'react';

import {ThemeContext} from 'components/theme/theme-context';
import {Theme, UITheme} from 'types/Theme';

const useTheme = (): Theme => {
  return React.useContext(ThemeContext);
};

const useUITheme = (): UITheme => {
  return useTheme().uiTheme;
};

export {
  useTheme,
  useUITheme,
};
