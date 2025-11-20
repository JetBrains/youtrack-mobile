import React from 'react';
import {View} from 'react-native';

import {Provider} from 'react-redux';
import {render} from '@testing-library/react-native';

import Select from 'components/select/select';
import utils from 'test/mocks';
import {DEFAULT_THEME} from 'components/theme/theme';
import {ThemeContext} from 'components/theme/theme-context';

import type {IItem, ISelectProps} from 'components/select/select';

const storeMock = utils.createMockStore({})({
  app: {},
});

export function renderTestSelectComponent<T extends IItem = IItem>(
  props: Partial<ISelectProps<T> & {Component: React.ComponentType<any> | undefined}> = {},
) {
  const {Component = Select} = props;
  return render(
    <Provider store={storeMock}>
      <ThemeContext.Provider value={{uiTheme: DEFAULT_THEME}}>
        <Component
          getTitle={(it: T) => it.name}
          dataSource={jest.fn()}
          {...props}
          getWrapperComponent={() => View}
        />
      </ThemeContext.Provider>
    </Provider>
  );
}
