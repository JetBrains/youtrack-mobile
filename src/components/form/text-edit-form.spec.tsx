import React from 'react';
import {render} from '@testing-library/react-native';

import TextEditForm from './text-edit-form';
import {defaultTheme} from 'components/theme/theme';
import {ThemeContext} from 'components/theme/theme-context';

describe('TextEditForm', () => {
  function doRender(description: string, onDescriptionChange: (text: string) => void) {
    return render(
      <ThemeContext.Provider value={defaultTheme}>
        <TextEditForm
          editable={true}
          description={description}
          multiline={true}
          onDescriptionChange={onDescriptionChange}
        />
      </ThemeContext.Provider>
    );
  }

  it('should keep the native input `onChangeText` handler reference stable when the description value commits back while typing', () => {
    const onDescriptionChange = jest.fn();
    const {getByTestId, rerender} = doRender('Hello', onDescriptionChange);
    const firstHandler = getByTestId('test:id/multiline-input').props.onChangeText;

    rerender(
      <ThemeContext.Provider value={defaultTheme}>
        <TextEditForm
          editable={true}
          description={'Hello world'}
          multiline={true}
          onDescriptionChange={onDescriptionChange}
        />
      </ThemeContext.Provider>
    );
    const secondHandler = getByTestId('test:id/multiline-input').props.onChangeText;

    expect(secondHandler).toBe(firstHandler);
  });
});
