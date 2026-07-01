import React from 'react';
import {render} from '@testing-library/react-native';

import MultilineInput from './multiline-input';

describe('MultilineInput', () => {
  it('should keep the native input `style` prop reference stable when the component re-renders but style-relevant props did not change', () => {
    const style = {marginTop: 4};
    const {getByTestId, rerender} = render(
      <MultilineInput style={style} adaptive={false} editable={true} />
    );
    const firstStyle = getByTestId('test:id/multiline-input').props.style;

    rerender(<MultilineInput style={style} adaptive={false} editable={false} />);
    const secondStyle = getByTestId('test:id/multiline-input').props.style;

    expect(secondStyle).toBe(firstStyle);
  });
});
