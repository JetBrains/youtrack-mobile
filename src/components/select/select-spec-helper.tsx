import Select, {IItem, ISelectProps} from 'components/select/select';
import React from 'react';
import {render} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {ThemeContext} from 'components/theme/theme-context';
import {DEFAULT_THEME} from 'components/theme/theme';
import {View} from 'react-native';
import utils from '../../../test/mocks';

const storeMock = utils.createMockStore({})({
  app: {},
});

export function renderTestSelectComponent(props: Partial<ISelectProps & { Component: React.ComponentType<any> | undefined }> = {}) {
  const {Component = Select} = props;
  return render(
    <Provider store={storeMock}>
      <ThemeContext.Provider value={{uiTheme: DEFAULT_THEME}}>
        <Component
          getTitle={(it: IItem) => it.name}
          dataSource={jest.fn()}
          {...props}
          getWrapperComponent={() => View}
        />
      </ThemeContext.Provider>
    </Provider>
  );
}
