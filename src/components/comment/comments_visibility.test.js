import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import {ResourceTypes} from '../api/api__resource-types';
import CommentVisibility from './comment__visibility';

import type {Visibility} from '../../flow/Visibility';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


describe('<CommentVisibility/>', () => {

  let wrapper: Object;
  let visibilityMock: Visibility;

  beforeEach(() => {
    visibilityMock = {
      $type: ResourceTypes.VISIBILITY_UNLIMITED,
      permittedUsers: [],
      permittedGroups: []
    };
    wrapper = doShallow(visibilityMock);
  });


  describe('Render', () => {
    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId('commentVisibility')).toHaveLength(1);
      expect(findByTestId('commentVisibilityIcon')).toHaveLength(1);
    });

    it('should not render component', () => {
      wrapper = doShallow(null);

      expect(findByTestId('commentVisibility')).toHaveLength(0);
      expect(findByTestId('commentVisibilityIcon')).toHaveLength(0);
    });

    it('should colorize component', () => {
      const color = 'red';
      wrapper = doShallow(visibilityMock, color);

      expect(wrapper.contains(
        <Icon testID="commentVisibilityIcon" name="lock" size={16} color={color}/>
      )).toEqual(true);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(visibility?: Visibility, color?: string) {
    return shallow(
      <CommentVisibility
        visibility={visibility}
        color={color}
      />
    );
  }
});
