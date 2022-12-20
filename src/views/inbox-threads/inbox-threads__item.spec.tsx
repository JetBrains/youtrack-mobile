import React from 'react';
import {View} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import mocks from '../../../test/mocks';
import ThreadItem from './inbox-threads__item';
describe('Inbox Threads Item', () => {
  it('should render component', () => {
    const {getByTestId} = doRender({});
    expect(getByTestId('test:id/inboxThreadItem')).toBeDefined();
  });
  it('should render custom avatar', () => {
    const {getByTestId} = doRender({
      avatar: <View testID="inboxThreadItemAvatar" />,
    });
    expect(getByTestId('inboxThreadItemAvatar')).toBeDefined();
  });
  it('should render reason', () => {
    const reasonMock = 'reason text';
    const {getByText} = doRender({
      reason: reasonMock,
    });
    expect(getByText(reasonMock)).toBeDefined();
  });
  it('should not render merged activities', () => {
    const {getByTestId} = doRender({});
    expect(() =>
      getByTestId('test:id/inboxThreadItemMergedActivities'),
    ).toThrow();
  });
  it('should render merged activities', () => {
    const {getByTestId} = doRender({
      group: {
        head: {
          id: 'headId',
        },
        mergedActivities: [mocks.createActivityCustomFieldMock()],
      },
    });
    expect(
      getByTestId('test:id/inboxThreadItemMergedActivities'),
    ).toBeDefined();
  });
  it('should disable navigate to change button if `onNavigate` callback is not provided', () => {
    const {getByTestId} = doRender({});
    expect(getByTestId('test:id/inboxThreadItemNavigateButton')).toBeDisabled();
  });
  it('should not invoke a callback `onNavigate` if it is not provided', () => {
    const onNavigate = null;
    const {getByTestId} = doRender({
      onNavigate,
    });
    expect(getByTestId('test:id/inboxThreadItemNavigateButton')).toBeDisabled();
  });
  it('should navigate to change button if `onNavigate` callback is not provided', () => {
    const onNavigate = jest.fn();
    const {getByTestId} = doRender({
      onNavigate,
    });
    expect(
      getByTestId('test:id/inboxThreadItemNavigateButton'),
    ).not.toBeDisabled();
    fireEvent.press(getByTestId('test:id/inboxThreadItemNavigateButton'));
    expect(onNavigate).toHaveBeenCalled();
  });
});

function doRender({
  change = null,
  group,
  onNavigate,
  avatar = <View />,
  reason = 'commented',
  timestamp = 1,
}) {
  return render(
    <ThreadItem
      author={mocks.createUserMock()}
      avatar={avatar}
      change={change}
      group={group}
      reason={reason}
      timestamp={timestamp}
      onNavigate={onNavigate}
    />,
  );
}
