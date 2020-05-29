import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Select from './select';

describe('<Select/>', () => {

  let wrapper;

  beforeEach(() => {
    wrapper = doShallow();
  });


  describe('Render', () => {
    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId('select')).toHaveLength(1);
      expect(findByTestId('selectInput')).toHaveLength(1);
      expect(findByTestId('selectItems')).toHaveLength(1);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow() {
    return shallow(
      <Select/>
    );
  }
});
