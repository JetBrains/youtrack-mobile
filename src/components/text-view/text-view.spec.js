import React from 'react';

import {shallow} from 'enzyme';
import TextView from './text-view';

import {buildStyles, DEFAULT_THEME} from '../theme/theme';

describe('<TextView/>', () => {

  let wrapper;
  let textMock;

  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));

  describe('Render', () => {
    beforeEach(() => {
      textMock = 'A'.repeat(100);
      wrapper = doShallow(textMock);
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
