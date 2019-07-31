import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import TextView from './text-view';

describe('<TextView/>', () => {

  let wrapper;
  let textMock;

  describe('Render', () => {
    beforeEach(() => {
      textMock = 'A'.repeat(100);
      wrapper = doShallow(textMock);
    });

    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render content with `Show more...`', () => {
      expect(findByTestId('textMoreContent')).toHaveLength(1);
      expect(findByTestId('textMoreShowMore')).toHaveLength(1);
    });

    it('should render content with `Show more...` if there is not more to show (take a threshold into account)', () => {
      textMock = 'A'.repeat(wrapper.DEFAULT_CUT_LENGTH + wrapper.THRESHOLD + 1);
      wrapper = doShallow(textMock);
      expect(findByTestId('textMoreContent')).toHaveLength(1);
      expect(findByTestId('textMoreShowMore')).toHaveLength(0);
    });

    it('should render content only', () => {
      textMock = 'A'.repeat(20);
      wrapper = doShallow(textMock);

      expect(findByTestId('textMoreContent')).toHaveLength(1);
      expect(findByTestId('textMoreShowMore')).toHaveLength(0);
    });

  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(text = '', maxLength = 80) {
    return shallow(
      <TextView
        maxLength={maxLength}
        text={text}
      />
    );
  }
});
