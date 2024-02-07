import React from 'react';

import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import {ResourceTypes} from 'components/api/api__resource-types';
import VisibilityControl from './visibility-control';

import {UserGroup} from 'types/UserGroup';
import {Visibility, VisibilityGroups} from 'types/Visibility';

jest.mock('components/select/select-sectioned', () => 'SelectSectioned');

describe('<VisibilityControl/>', () => {
  let visibilityMock: Visibility;
  let visibilityRestrictedMock: Visibility;
  let counter: number;
  let onApplyMock: jest.Mock;
  let onSubmitMock: jest.Mock;
  const getOptionsFn = () => Promise.resolve({} as VisibilityGroups);

  afterEach(cleanup);
  beforeEach(() => {
    counter = 0;
    visibilityMock = {
      $type: ResourceTypes.VISIBILITY_UNLIMITED,
    };
    visibilityRestrictedMock = {
      $type: ResourceTypes.VISIBILITY_LIMITED,
      permittedGroups: [{} as UserGroup],
    };
    onApplyMock = jest.fn();
    onSubmitMock = jest.fn();
  });

  it('should render component', () => {
    doRender();

    expect(screen.findByTestId('test:id/visibilityControl')).toBeTruthy();
    expect(screen.findByTestId('test:id/visibilityControlButton')).toBeTruthy();
  });

  it('should not render <Select/>', () => {
    doRender();

    expect(screen.queryByTestId('test:id/visibility-control-button')).toBeNull();
  });

  describe('Visibility', () => {
    it('should reset visibility', () => {
      doRender({visibility: visibilityRestrictedMock, onApply: onApplyMock, onSubmit: undefined});

      fireEvent.press(screen.getByTestId('test:id/visibilityResetButton'));

      expect(onApplyMock).toHaveBeenCalledWith(null);
    });

    it('should submit visibility', () => {
      const v = instantiate({
        visibility: visibilityRestrictedMock,
        onApply: onApplyMock,
        onSubmit: onSubmitMock,
      });

      act(() => {
        v.updateVisibility(visibilityRestrictedMock);
      });

      expect(onSubmitMock).toHaveBeenCalledWith(visibilityRestrictedMock);
      expect(onApplyMock).not.toHaveBeenCalledWith(visibilityRestrictedMock);
    });

    it('should apply visibility', () => {
      const v = instantiate({
        visibility: visibilityRestrictedMock,
        onApply: onApplyMock,
        onSubmit: undefined,
      });

      act(() => {
        v.updateVisibility(visibilityRestrictedMock);
      });

      expect(onSubmitMock).not.toHaveBeenCalledWith(visibilityRestrictedMock);
      expect(onApplyMock).toHaveBeenCalledWith(visibilityRestrictedMock);
    });
  });

  function doRender(params?: {visibility?: Visibility | null; onApply?: jest.Mock; onSubmit?: jest.Mock}) {
    render(
      <VisibilityControl
        onShow={() => counter++}
        onHide={() => counter--}
        visibility={params?.visibility || visibilityMock}
        onApply={params?.onApply}
        onSubmit={params?.onSubmit}
        getOptions={getOptionsFn}
      />
    );
  }

  function instantiate(params: {visibility: Visibility | null; onApply: jest.Mock; onSubmit?: jest.Mock}) {
    return new VisibilityControl({
      onShow: () => counter++,
      onHide: () => counter--,
      visibility: params.visibility,
      onApply: params.onApply,
      onSubmit: params.onSubmit,
      getOptions: getOptionsFn,
    });
  }
});
