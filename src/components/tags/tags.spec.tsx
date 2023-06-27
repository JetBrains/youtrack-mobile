import React from 'react';

import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import Tags from './tags';
import {Tag} from 'types/CustomFields';

jest.mock('@expo/react-native-action-sheet', () => ({
  ...jest.requireActual('@expo/react-native-action-sheet'),
}));
const ExpoActionSheet = require('@expo/react-native-action-sheet');


describe('<Tags/>', () => {
  let tagQueryMock;
  let onTagPressMock: jest.Mock;
  let tagMock: Tag;

  afterEach(cleanup);
  beforeEach(() => {
    tagQueryMock = 'tag: foo';
    onTagPressMock = jest.fn();
    tagMock = {
      name: 'tagName',
      color: {
        id: 'tagId',
        background: '0',
        foreground: '0',
      },
      query: tagQueryMock,
    } as Tag;
  });


  describe('Render', () => {
    it('should render component', () => {
      doRender({});

      expect(screen.getByTestId('test:id/tagsList')).toBeTruthy();
    });

    it('should not render component', () => {
      doRender({tags: []});
      expect(screen.queryByTestId('test:id/tagsList')).toBeNull();
    });
  });


  describe('Context actions', () => {
    let showActionSheetWithOptions: jest.Mock;
    let actionOptionShowAll: string;
    const actionsOptionCancel = 'Cancel';

    afterEach(() => ExpoActionSheet.useActionSheet.mockRestore());
    beforeEach(() => {
      actionOptionShowAll = `Show all issues tagged with \"${tagMock.name}\"...`;
      showActionSheetWithOptions = jest.fn();
      jest.spyOn(ExpoActionSheet, 'useActionSheet').mockReturnValue({
        showActionSheetWithOptions,
      });
    });

    it('should context actions', async () => {
      await renderContextActions({});

      const actionOptions = showActionSheetWithOptions.mock.calls[0][0];
      expect(showActionSheetWithOptions).toHaveBeenCalledTimes(1);
      expect(actionOptions.options[0]).toEqual(actionOptionShowAll);
      expect(actionOptions.options[1]).toEqual(actionsOptionCancel);
    });

    it('should invoke the option `Show all issues tagged with...`', async () => {
      await renderContextActions({});

      const actionsFnCaller = showActionSheetWithOptions.mock.calls[0][1];
      actionsFnCaller(0);

      expect(onTagPressMock).toHaveBeenCalledWith(tagMock.query);
    });

    it('should invoke the option `Remove tag`', async () => {
      const onTagRemoveMock = jest.fn();
      await renderContextActions({onTagRemove: onTagRemoveMock});

      const actionOptions = showActionSheetWithOptions.mock.calls[0][0];
      expect(actionOptions.options[0]).toEqual(actionOptionShowAll);
      expect(actionOptions.options[1]).toEqual('Remove tag');
      expect(actionOptions.options[2]).toEqual(actionsOptionCancel);

      const actionsFnCaller = showActionSheetWithOptions.mock.calls[0][1];
      actionsFnCaller(1);

      expect(onTagRemoveMock).toHaveBeenCalledWith(tagMock.id);
    });

    async function renderContextActions(params: {
      tags?: Tag[],
      onTagRemove?: jest.Mock,
      onTagPress?: jest.Mock
    }) {
      doRender(params);
      fireEvent.press(screen.getByTestId('test:id/tagsList'));
      await expect(screen.getByTestId('test:id/tagsListTag')).toBeTruthy();
      fireEvent.press(screen.getByTestId('test:id/tagsListTag'));
    }
  });


  function doRender({tags = [tagMock], onTagRemove, onTagPress = onTagPressMock}: {
    tags?: Tag[],
    onTagRemove?: jest.Mock,
    onTagPress?: jest.Mock
  }) {
    return render(<Tags tags={tags} onTagPress={onTagPress} onTagRemove={onTagRemove}/>);
  }
});
