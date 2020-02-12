import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import ErrorMessageInline from './error-message-inline';


describe('<ErrorMessageInline/>', () => {

  const ERROR_TEST_ID = 'errorMessageInlineError';
  const TIPS_TEST_ID = 'errorMessageInlineTip';
  let wrapper;
  let instance;
  let errorMock;

  beforeEach(() => {
    errorMock = 'Test error';
  });


  describe('Render', () => {
    it('should match a snapshot', () => {
      render(errorMock);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render error', () => {
      render(errorMock);

      expect(findByTestId(ERROR_TEST_ID)).toHaveLength(1);
      expect(findByTestId(TIPS_TEST_ID)).toHaveLength(0);
    });

    it('should render error with tips', () => {
      render(errorMock, 'Network Error');

      expect(findByTestId(ERROR_TEST_ID)).toHaveLength(1);
      expect(findByTestId(TIPS_TEST_ID)).toHaveLength(1);
    });

    it('should render error with a support link', () => {
      render(errorMock, null, true);

      expect(findByTestId(ERROR_TEST_ID)).toHaveLength(1);
      expect(findByTestId(TIPS_TEST_ID)).toHaveLength(0);
    });

  });


  function render(error: string, tips?: string, showSupportLink: boolean = false) {
    wrapper = doShallow(error, tips, showSupportLink);
    instance = wrapper.instance();
    return instance;
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow(error: string, tips?: string, showSupportLink: boolean = false) {
    return shallow(
      <ErrorMessageInline
        error={error}
        tips={tips}
        showSupportLink={showSupportLink}
      />
    );
  }
});
