import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Tags from './tags';

describe('<Tags/>', () => {

  let wrapper;
  let tagQueryMock;
  let onPressMock;

  describe('Render', () => {
    beforeEach(() => {
      tagQueryMock = 'tag: foo';
      onPressMock = jest.fn();
      wrapper = doShallow([{color: {id: 1}, query: tagQueryMock}], onPressMock);
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

    it('should redirect on click on a tag', () => {
      findByTestId('tagsTag').simulate('press');

      expect(onPressMock).toHaveBeenCalledWith(tagQueryMock);
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
