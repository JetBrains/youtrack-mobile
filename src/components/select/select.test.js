import React from 'react';

import {shallow} from 'enzyme';

import Select from './select';
import {buildStyles, DEFAULT_THEME} from '../theme/theme';

describe('<Select/>', () => {

  let wrapper;

  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));

  beforeEach(() => {
    wrapper = doShallow();
  });

  describe('Render', () => {
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
