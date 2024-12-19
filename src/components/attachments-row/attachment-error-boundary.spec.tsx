import React from 'react';
import {Text} from 'react-native';

import {render, screen} from '@testing-library/react-native';

import AttachmentErrorBoundary from './attachment-error-boundary';

describe('<AttachmentErrorBoundary/>', () => {
  const childrenTestId = 'attachmentErrorBoundaryChildren';
  const errorPlaceholderTestId = 'attachmentErrorBoundaryPlaceholder';

  describe('Render', () => {
    it('should render children', () => {
      render(
        <AttachmentErrorBoundary attachName="name">
          <Text testID={childrenTestId}>txt</Text>
        </AttachmentErrorBoundary>
      );

      expect(screen.queryByTestId(errorPlaceholderTestId)).toBeNull();
      expect(screen.getByTestId(childrenTestId)).toBeTruthy();
    });
  });

  describe('Render placeholder', () => {
    const BuggyComponent = () => {
      throw new Error('Render error simulated');
    };

    it('should render error placeholder', () => {
      render(
        <AttachmentErrorBoundary attachName="name">
          <BuggyComponent />
        </AttachmentErrorBoundary>
      );
      expect(screen.getByTestId(errorPlaceholderTestId)).toBeTruthy();
      expect(screen.queryByTestId(childrenTestId)).toBeNull();
    });
  });
});
