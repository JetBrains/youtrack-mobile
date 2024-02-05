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

      expect(screen.getByTestId('test:id/commentVisibility')).toBeTruthy();
      expect(screen.getByTestId('test:id/commentVisibilityIcon')).toBeTruthy();
      expect(screen.getByTestId('test:id/commentVisibilityLabel')).toBeTruthy();
    });

    it('should not render visibility text', () => {
      doRender();

      expect(screen.queryByTestId('test:id/commentVisibilityLabel')).toBeNull();
    });

    it('should set custom color to the icon', () => {
      doRender(visibilityPresentation, 'red');

      expect(screen.getByTestId('test:id/commentVisibilityIcon')).toHaveProp('color', 'red');
    });
  });


  function doRender(presentation?: string, color?: string) {
    return render(<CommentVisibility presentation={presentation} color={color} />);
  }
});
