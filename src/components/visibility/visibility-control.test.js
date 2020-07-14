import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import {ResourceTypes} from '../api/api__resource-types';
import VisibilityControl from './visibility-control';

describe('<VisibiltyControl/>', () => {

  let wrapper;
  let instance;
  let visibilityMock;

  beforeEach(() => {
    visibilityMock = {
      $type: ResourceTypes.VISIBILITY_UNLIMITED
    };

    render();
  });


  describe('Render', () => {
    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should initialize state', () => {
      expect(findByTestId('visibilityControl')).toHaveLength(1);
      expect(findByTestId('visibilityControlButton')).toHaveLength(1);
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
        permittedGroups: [{}]
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
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(visibility, onApply = () => {}, onSubmit = () => {}) {
    return shallow(
      <VisibilityControl
        issueId={'issueID'}
        visibility={visibility}
        onApply={onApply}
        onSubmit={onSubmit}
      />
    );
  }

  function render(onApply, onSubmit) {
    wrapper = doShallow(visibilityMock, onApply, onSubmit);
    instance = wrapper.instance();
  }
});
