import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Diff from './diff';

describe('<Diff/>', () => {

  let wrapper;
  let text1;
  let text2;

  describe('Render', () => {
    text1 = 'ABCy';
    text2 = 'xABC';
    beforeEach(() => {
      wrapper = doShallow(text1, text2);
    });

    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render component', () => {
      expect(findByTestId('diff')).toHaveLength(1);
    });

    it('should render difference', () => {
      expect(findByTestId('diffInsert')).toHaveLength(1);
      expect(findByTestId('diffDelete')).toHaveLength(1);
      expect(findByTestId('diffEqual')).toHaveLength(1);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(text1, text2) {
    return shallow(
      <Diff text1={text1} text2={text2}/>
    );
  }
});
