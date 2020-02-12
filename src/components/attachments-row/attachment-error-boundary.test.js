import React from 'react';
import {Text} from 'react-native';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import AttachmentErrorBoundary from './attachment-error-boundary';


describe('<AttachmentErrorBoundary/>', () => {

  const childrenTestId = 'attachmentErrorBoundaryChildren';
  const errorPlaceholderTestId = 'attachmentErrorBoundaryPlaceholder';
  let wrapper;

  beforeEach(() => {
    wrapper = doShallow();
  });

  describe('Render', () => {
    it('should match a snapshot', () => {
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render children', () => {
      expect(findByTestId(errorPlaceholderTestId)).toHaveLength(0);
      expect(findByTestId(childrenTestId)).toHaveLength(1);
    });
  });


  describe('Render placeholder', () => {
    it('should render error placeholder', () => {
      wrapper.setState({hasError: true});

      expect(findByTestId(errorPlaceholderTestId)).toHaveLength(1);
      expect(findByTestId(childrenTestId)).toHaveLength(0);
    });
  });


  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function doShallow() {
    return shallow(
      <AttachmentErrorBoundary>
        <Text testID={childrenTestId}>children</Text>
      </AttachmentErrorBoundary>
    );
  }
});
