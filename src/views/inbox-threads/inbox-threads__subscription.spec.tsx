import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import InboxThreadItemSubscription from './inbox-threads__subscription';
import mocks from '../../../test/mocks';
import {DEFAULT_THEME} from 'components/theme/theme';
let apiMock;
let storeMock;

const getApi = () => apiMock;

describe('InboxThreadItemSubscription', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    apiMock = {};
    storeMock = mocks.createMockStore([thunk.withExtraArgument(getApi)])({
      app: {
        networkState: {
          isConnected: true,
        },
      },
    });
  });
  describe('Render', () => {
    it('should render item', () => {
      const {getByTestId} = doRender(mocks.createThreadMock());
      expect(getByTestId('test:id/inboxThreadsSubscription')).toBeTruthy();
    });
    it('should render group', () => {
      const {getByTestId} = doRender(mocks.createThreadMock());
      expect(getByTestId('test:id/inboxThreadsSubscriptionGroup')).toBeTruthy();
    });
    describe('`show more` button', () => {
      let splittedActivitiesMock;
      let module;
      beforeEach(() => {
        module = require('components/activity/activity__split-activities');
        splittedActivitiesMock = Array(4)
          .fill(0)
          .map((it, index) => ({
            head: {
              id: `id${index}`,
            },
            messages: [{}],
          }));
        jest.spyOn(module, 'splitActivities');
      });
      it('should show button', () => {
        module.splitActivities.mockImplementationOnce(
          () => splittedActivitiesMock,
        );
        const {getByTestId} = renderAndGetMatcher();
        expect(
          getByTestId('test:id/inboxThreadsSubscriptionShowMore'),
        ).toBeTruthy();
      });
      it('should not show button', () => {
        module.splitActivities.mockImplementationOnce(() =>
          splittedActivitiesMock.slice(0, 2),
        );
        const {queryByTestId} = renderAndGetMatcher();
        expect(
          queryByTestId('test:id/inboxThreadsSubscriptionShowMore'),
        ).toBeNull();
      });

      function renderAndGetMatcher() {
        return doRender(mocks.createThreadMock());
      }
    });
  });
  describe('Read/Unread', () => {
    let onReadToggleMockFn;
    let threadMock;
    beforeEach(() => {
      onReadToggleMockFn = jest.fn();
      threadMock = mocks.createThreadMock();
    });
    it('should mark a thread as read', () => {
      const {getByTestId} = doRender(threadMock, onReadToggleMockFn);
      fireEvent.press(
        getByTestId('test:id/inboxThreadsSubscriptionGroupReadToggle'),
      );
      expect(onReadToggleMockFn).toHaveBeenCalled();
    });
    it('should mark a thread as unread', () => {
      const {getByTestId} = doRender(
        {...threadMock, messages: [{...threadMock.messages[0], read: true}]},
        onReadToggleMockFn,
      );
      fireEvent.press(
        getByTestId('test:id/inboxThreadsSubscriptionGroupReadToggle'),
      );
      expect(onReadToggleMockFn).toHaveBeenCalled();
    });
  });
});

function doRender(thread, onReadToggle) {
  return render(
    <Provider store={storeMock}>
      <InboxThreadItemSubscription
        thread={thread}
        currentUser={mocks.createUserMock()}
        uiTheme={DEFAULT_THEME}
        onReadChange={onReadToggle}
      />
    </Provider>,
  );
}