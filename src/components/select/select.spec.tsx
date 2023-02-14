import React from 'react';
import {View} from 'react-native';

import {cleanup, screen, waitFor} from '@testing-library/react-native';

import {ISelectProps, SelectModal} from './select';
import {renderTestSelectComponent} from 'components/select/select-spec-helper';


jest.mock('react-native-portalize', () => ({
  Portal: 'View',
}));


describe('Select', () => {
  let dataSourceMock: jest.Mock;

  beforeEach(() => {
    dataSourceMock = jest.fn();
  });
  afterEach(cleanup);


  describe('<Select/>', () => {
    beforeEach(() => {
      doRender({
        dataSource: dataSourceMock.mockResolvedValueOnce([{name: 'foo', key: '1'}, {name: 'bar', key: '2'}]),
      });
    });

    it('should render Select', async () => {
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
      await waitFor(() => expect(screen.getAllByTestId('test:id/selectListItem')).toHaveLength(2));
    });
  });


  describe('<SelectModal/>', () => {
    beforeEach(() => {
      dataSourceMock = jest.fn();
      doRender({
        Component: SelectModal,
        dataSource: dataSourceMock.mockResolvedValueOnce([{name: 'foo', key: '1'}, {name: 'bar', key: '2'}]),
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
