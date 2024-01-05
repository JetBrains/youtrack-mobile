import React from 'react';

import {cleanup, render, screen} from '@testing-library/react-native';

import CommentVisibility from './comment__visibility';

jest.mock('components/icon/icon', () => ({
  IconLock: 'IconLock',
}));

describe('<CommentVisibility/>', () => {
  let visibilityPresentation: string;

  afterEach(cleanup);

  beforeEach(() => {
    visibilityPresentation = 'Hidden';
  });


  describe('Render', () => {
    it('should render component', () => {
      doRender(visibilityPresentation);

      expect(screen.getByTestId('commentVisibility')).toBeTruthy();
      expect(screen.getByTestId('commentVisibilityIcon')).toBeTruthy();
    });

    it('should not render component', () => {
      doRender(null);

      expect(screen.queryByTestId('commentVisibility')).toBeNull();
    });

    it('should set custom color to the icon', () => {
      doRender(visibilityPresentation, 'red');

      expect(screen.getByTestId('commentVisibilityIcon')).toHaveProp('color', 'red');
    });
  });


  function doRender(presentation: string | null, color?: string) {
    return render(<CommentVisibility presentation={presentation} color={color} />);
  }
});
