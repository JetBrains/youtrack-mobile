import React from 'react';
import {View} from 'react-native';

import {screen, waitFor} from '@testing-library/react-native';

import {ISelectProps, SelectModal} from './select';
import {renderTestSelectComponent} from 'components/select/select-spec-helper';


jest.mock('react-native-portalize', () => ({
  Portal: 'View',
}));

jest.mock('lodash.debounce');


describe('Select', () => {
  let dataSourceMock: jest.Mock;
  let renderParams: {dataSource: jest.Mock};

  beforeEach(() => {
    dataSourceMock = jest.fn();
    renderParams = {
      dataSource: dataSourceMock.mockResolvedValue([{name: 'foo', key: '1'}, {name: 'bar', key: '2'}]),
    };
  });
  afterEach(() => {
    jest.resetAllMocks();
  });


  describe('<Select/>', () => {
    it('should render Select', async () => {
      doRender(renderParams);

      await expect(screen.getByTestId('test:id/select')).toBeTruthy();
      await expect(screen.getByTestId('test:id/selectInput')).toBeTruthy();
      await expect(screen.getByTestId('test:id/selectList')).toBeTruthy();
    });

    it('should render multiple Select', () => {
      doRender({multi: true});

      expect(screen.getByTestId('test:id/applyButton')).toBeTruthy();
    });

    it('should render `header`', () => {
      doRender({header: () => <View testID="Header"/>});

      expect(screen.getByTestId('Header')).toBeTruthy();
    });

    it('should render list items', async () => {
      doRender(renderParams);

      await waitFor(
        () => expect(screen.getAllByTestId('test:id/selectListItem')).toHaveLength(2)
      );
    });
  });


  describe('<SelectModal/>', () => {
    beforeEach(() => {
      dataSourceMock = jest.fn();
      doRender({
        Component: SelectModal,
        dataSource: renderParams.dataSource,
      });
    });

    it('should render SelectModal', async () => {
      await expect(screen.getByTestId('test:id/selectModalContainer')).toBeTruthy();
      await expect(screen.getByTestId('test:id/select')).toBeTruthy();
      await expect(screen.getByTestId('test:id/selectInput')).toBeTruthy();
      await expect(screen.getByTestId('test:id/selectList')).toBeTruthy();
    });
  });


  function doRender(props: Partial<ISelectProps & { Component: React.ComponentType<any> | undefined }> = {}) {
    return renderTestSelectComponent(props);
  }
});
