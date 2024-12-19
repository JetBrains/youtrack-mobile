import React from 'react';

import {render, screen} from '@testing-library/react-native';

import ErrorMessageInline from './error-message-inline';

describe('<ErrorMessageInline/>', () => {
  const ERROR_TEST_ID = 'errorMessageInlineError';
  const TIPS_TEST_ID = 'errorMessageInlineTip';
  let errorMock: string;

  beforeEach(() => {
    errorMock = 'Test error';
  });

  describe('Render', () => {
    it('should render error', () => {
      renderComponent(errorMock);

      expect(screen.getByTestId(ERROR_TEST_ID)).toBeTruthy();
      expect(screen.queryByTestId(TIPS_TEST_ID)).not.toBeTruthy();
    });

    it('should render error with tips', () => {
      renderComponent(errorMock, 'Network Error');

      expect(screen.getByTestId(ERROR_TEST_ID)).toBeTruthy();
      expect(screen.getByTestId(TIPS_TEST_ID)).toBeTruthy();
    });

    it('should render error with a support link', () => {
      renderComponent(errorMock, undefined, true);

      expect(screen.getByTestId(ERROR_TEST_ID)).toBeTruthy();
      expect(screen.queryByTestId(TIPS_TEST_ID)).not.toBeTruthy();
    });
  });

  function renderComponent(error: string, tips?: string, showSupportLink: boolean = false) {
    render(<ErrorMessageInline error={error} tips={tips} showSupportLink={showSupportLink} />);
  }
});
