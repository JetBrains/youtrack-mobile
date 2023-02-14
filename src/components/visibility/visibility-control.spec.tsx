import React from 'react';
import {shallow} from 'enzyme';
import {ResourceTypes} from '../api/api__resource-types';
import VisibilityControl from './visibility-control';
import {VisibilityGroups} from 'types/Visibility';
describe('<VisibilityControl/>', () => {
  let wrapper;
  let instance;
  let visibilityMock;
  let counter;
  beforeEach(() => {
    counter = 0;
    visibilityMock = {
      $type: ResourceTypes.VISIBILITY_UNLIMITED,
    };
    render();
  });
  describe('Render', () => {
    it('should initialize state', () => {
      expect(findByTestId('visibilityControl')).toHaveLength(1);
      expect(findByTestId('test:id/visibilityControlButton')).toHaveLength(1);
    });
  });
  describe('Init', () => {
    it('should initialize state', () => {
      expect(instance.state.visibility).toEqual(visibilityMock);
      expect(instance.state.isSelectVisible).toEqual(false);
    });
  });
  describe('Visibility', () => {
    let restrictedVisibilityMock;
    let onApplyMock;
    let onSubmitMock;
    beforeEach(() => {
      restrictedVisibilityMock = {
        $type: ResourceTypes.VISIBILITY_LIMITED,
        permittedGroups: [{}],
      };
      onApplyMock = jest.fn();
      onSubmitMock = jest.fn();
    });
    it('should reset visibility', () => {
      render(onApplyMock, onSubmitMock);
      instance.resetVisibility();
      expect(instance.state.visibility).toEqual(null);
    });
    it('should submit visibility', () => {
      render(onApplyMock, onSubmitMock);
      instance.updateVisibility(restrictedVisibilityMock);
      expect(onSubmitMock).toHaveBeenCalledWith(restrictedVisibilityMock);
      expect(onApplyMock).not.toHaveBeenCalledWith(restrictedVisibilityMock);
    });
    it('should apply visibility', () => {
      render(onApplyMock, null);
      instance.updateVisibility(restrictedVisibilityMock);
      expect(onSubmitMock).not.toHaveBeenCalledWith(restrictedVisibilityMock);
      expect(onApplyMock).toHaveBeenCalledWith(restrictedVisibilityMock);
    });
    it('should update state with a new visibility', () => {
      instance.updateVisibility(restrictedVisibilityMock);
      expect(instance.state.visibility).toEqual(restrictedVisibilityMock);
    });
    it('should invoke `onShow` and `onHide` callback', () => {
      render();
      expect(counter).toEqual(0);
      instance.setSelectVisible(true);
      expect(counter).toEqual(1);
      instance.setSelectVisible(false);
      expect(counter).toEqual(0);
    });
  });

  function findByTestId(testId) {
    return (
      wrapper &&
      wrapper.find({
        testID: testId,
      })
    );
  }

  function doShallow(visibility, onApply = () => {}, onSubmit = () => {}) {
    return shallow(
      <VisibilityControl
        onShow={() => counter++}
        onHide={() => counter--}
        visibility={visibility}
        onApply={onApply}
        onSubmit={onSubmit}
        getOptions={() => Promise.resolve({} as VisibilityGroups)}
      />,
    );
  }

  function render(onApply, onSubmit) {
    wrapper = doShallow(visibilityMock, onApply, onSubmit);
    instance = wrapper.instance();
  }
});
