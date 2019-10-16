import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import Diff from './diff';

describe('<Diff/>', () => {

  let wrapper;
  let text1;
  let text2;

  beforeEach(() => {
    text1 = 'ABCy';
    text2 = 'xABC';
  });

  describe('Render', () => {
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
      expect(findByTestId('diffText')).toHaveLength(1);
      expect(findByTestId('diffInsert')).toHaveLength(1);
      expect(findByTestId('diffDelete')).toHaveLength(1);
      expect(findByTestId('diffEqual')).toHaveLength(1);
    });

    it('should not render collapse/expand title', () => {
      expect(findByTestId('diffToggle')).toHaveLength(0);
    });
  });


  describe('Collapse/expand', () => {
    let title;
    beforeEach(() => {
      title = 'Details';
      wrapper = doShallow(text1, text2, title);
    });

    it('should render collapse/expand title', () => {
      expect(findByTestId('diffToggle')).toHaveLength(1);
    });

    it('should not render diff', () => {
      expect(findByTestId('diffText')).toHaveLength(0);
    });

    it('should render diff after click on a title', () => {
      findByTestId('diffToggle').simulate('press');
      expect(findByTestId('diffText')).toHaveLength(1);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(text1, text2, title) {
    return shallow(
      <Diff title={title} text1={text1} text2={text2}/>
    );
  }
});
