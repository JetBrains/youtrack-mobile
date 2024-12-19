import React from 'react';
import {render, screen} from '@testing-library/react-native';

import TextView, {DEFAULT_MAX_LENGTH, THRESHOLD} from './text-view';

describe('<TextView/>', () => {
  describe('Render', () => {
    it('should render content with `Show more...`', () => {
      render(<TextView maxLength={80} text={'A'.repeat(100)} />);

      expect(screen.getByTestId('textMoreContent')).toBeTruthy();
      expect(screen.getByTestId('textMoreShowMore')).toBeTruthy();
    });

    it('should render content without `Show more...` if there is no more to show (take a threshold into account)', () => {
      render(<TextView maxLength={80} text={'A'.repeat(DEFAULT_MAX_LENGTH + THRESHOLD + 10)} />);

      expect(screen.getByTestId('textMoreContent')).toBeTruthy();
      expect(screen.queryByTestId('textMoreShowMore')).toBeNull();
    });

    it('should render content only', () => {
      render(<TextView maxLength={80} text={'A'.repeat(20)} />);

      expect(screen.getByTestId('textMoreContent')).toBeTruthy();
      expect(screen.queryByTestId('textMoreShowMore')).toBeNull();
    });
  });
});
