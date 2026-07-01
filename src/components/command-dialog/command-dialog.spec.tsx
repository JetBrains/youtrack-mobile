import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';

import CommandDialog from './command-dialog';
import {DEFAULT_THEME} from 'components/theme/theme';

jest.mock('components/modal-view/modal-view', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => <View>{children}</View>,
  };
});

describe('CommandDialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function doRender(props?: Partial<React.ComponentProps<typeof CommandDialog>>) {
    return render(
      <CommandDialog
        suggestions={null}
        initialCommand=""
        onApply={jest.fn()}
        onChange={jest.fn()}
        isApplying={false}
        onCancel={jest.fn()}
        uiTheme={DEFAULT_THEME}
        {...props}
      />
    );
  }

  it('does not let a debounced stale selection search overwrite typed text', () => {
    const onChange = jest.fn();
    const {getByTestId} = doRender({onChange});
    const input = getByTestId('test:id/selectInput');
    const staleSelectionChange = input.props.onSelectionChange;

    fireEvent.changeText(input, 'State Fixed');
    expect(getByTestId('test:id/selectInput').props.value).toBe('State Fixed');

    staleSelectionChange({
      nativeEvent: {
        selection: {
          start: 11,
          end: 11,
        },
      },
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(getByTestId('test:id/selectInput').props.value).toBe('State Fixed');
    expect(onChange).toHaveBeenLastCalledWith('State Fixed', 11);
  });

  it('does not re-render the controlled input for selection-only changes', () => {
    const renderSpy = jest.spyOn(CommandDialog.prototype, 'render');
    const {getByTestId} = doRender();
    renderSpy.mockClear();

    fireEvent(getByTestId('test:id/selectInput'), 'selectionChange', {
      nativeEvent: {
        selection: {
          start: 0,
          end: 0,
        },
      },
    });

    expect(renderSpy).not.toHaveBeenCalled();
    renderSpy.mockRestore();
  });
});
