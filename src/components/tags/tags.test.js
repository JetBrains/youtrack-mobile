import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Tags from './tags';

describe('<Tags/>', () => {

  let wrapper;

  describe('Render', () => {
    beforeEach(() => {
      wrapper = doShallow([{color: {id: 1}}]);
    });

    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId('tags')).toHaveLength(1);
    });

    it('should render color field', () => {
      expect(findByTestId('tagColor')).toHaveLength(1);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(tags = [], onTagPress = () => {}) {
    return shallow(
      <Tags
        tags={tags}
        onTagPress={onTagPress}
      />
    );
  }
});
