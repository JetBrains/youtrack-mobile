import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import SummaryDescriptionForm from './summary-description-form';
import {defaultTheme} from 'components/theme/theme';
import {ThemeContext} from 'components/theme/theme-context';

describe('SummaryDescriptionForm', () => {
  function doRender(props?: Partial<React.ComponentProps<typeof SummaryDescriptionForm>>) {
    return render(
      <ThemeContext.Provider value={defaultTheme}>
        <SummaryDescriptionForm
          editable={true}
          summary="Initial summary"
          description="Initial description"
          onSummaryChange={jest.fn()}
          onDescriptionChange={jest.fn()}
          {...props}
        />
      </ThemeContext.Provider>
    );
  }

  it('keeps summary input locally controlled and reports every typed value immediately', () => {
    const onSummaryChange = jest.fn();
    const {getByTestId} = doRender({onSummaryChange});
    const summaryInput = getByTestId('test:id/issue-summary');

    expect(summaryInput.props.value).toEqual('Initial summary');

    fireEvent.changeText(summaryInput, 'Initial summary a');
    expect(getByTestId('test:id/issue-summary').props.value).toEqual('Initial summary a');
    expect(onSummaryChange).toHaveBeenLastCalledWith('Initial summary a');

    fireEvent.changeText(getByTestId('test:id/issue-summary'), 'Initial summary ab');
    expect(getByTestId('test:id/issue-summary').props.value).toEqual('Initial summary ab');
    expect(onSummaryChange).toHaveBeenLastCalledWith('Initial summary ab');
  });

  it('does not replace focused summary text with stale props while typing', () => {
    const onSummaryChange = jest.fn();
    const {getByTestId, rerender} = doRender({onSummaryChange});

    fireEvent(getByTestId('test:id/issue-summary'), 'focus');
    fireEvent.changeText(getByTestId('test:id/issue-summary'), 'Local summary');

    rerender(
      <ThemeContext.Provider value={defaultTheme}>
        <SummaryDescriptionForm
          editable={true}
          summary="Stale summary"
          description="Initial description"
          onSummaryChange={onSummaryChange}
          onDescriptionChange={jest.fn()}
        />
      </ThemeContext.Provider>
    );

    expect(getByTestId('test:id/issue-summary').props.value).toEqual('Local summary');

    fireEvent(getByTestId('test:id/issue-summary'), 'blur');
    rerender(
      <ThemeContext.Provider value={defaultTheme}>
        <SummaryDescriptionForm
          editable={true}
          summary="External summary"
          description="Initial description"
          onSummaryChange={onSummaryChange}
          onDescriptionChange={jest.fn()}
        />
      </ThemeContext.Provider>
    );

    expect(getByTestId('test:id/issue-summary').props.value).toEqual('External summary');
  });

  it('keeps description input locally controlled and reports every typed value immediately', () => {
    const onDescriptionChange = jest.fn();
    const {getByTestId} = doRender({onDescriptionChange});
    const descriptionInput = getByTestId('test:id/multiline-input');

    expect(descriptionInput.props.value).toEqual('Initial description');

    fireEvent.changeText(descriptionInput, 'Initial description a');
    expect(getByTestId('test:id/multiline-input').props.value).toEqual('Initial description a');
    expect(onDescriptionChange).toHaveBeenLastCalledWith('Initial description a');

    fireEvent.changeText(getByTestId('test:id/multiline-input'), 'Initial description ab');
    expect(getByTestId('test:id/multiline-input').props.value).toEqual('Initial description ab');
    expect(onDescriptionChange).toHaveBeenLastCalledWith('Initial description ab');
  });

  it('does not replace focused description text with stale props while typing', () => {
    const onDescriptionChange = jest.fn();
    const {getByTestId, rerender} = doRender({onDescriptionChange});

    fireEvent(getByTestId('test:id/multiline-input'), 'focus');
    fireEvent.changeText(getByTestId('test:id/multiline-input'), 'Local description');

    rerender(
      <ThemeContext.Provider value={defaultTheme}>
        <SummaryDescriptionForm
          editable={true}
          summary="Initial summary"
          description="Stale description"
          onSummaryChange={jest.fn()}
          onDescriptionChange={onDescriptionChange}
        />
      </ThemeContext.Provider>
    );

    expect(getByTestId('test:id/multiline-input').props.value).toEqual('Local description');

    fireEvent(getByTestId('test:id/multiline-input'), 'blur');
    rerender(
      <ThemeContext.Provider value={defaultTheme}>
        <SummaryDescriptionForm
          editable={true}
          summary="Initial summary"
          description="External description"
          onSummaryChange={jest.fn()}
          onDescriptionChange={onDescriptionChange}
        />
      </ThemeContext.Provider>
    );

    expect(getByTestId('test:id/multiline-input').props.value).toEqual('External description');
  });
});
