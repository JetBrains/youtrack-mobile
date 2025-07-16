import React from 'react';

import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import {render} from '@testing-library/react-native';

import InboxThreadItemSubscription from './inbox-threads__subscription';
import mocks from 'test/mocks';
import {DEFAULT_THEME} from 'components/theme/theme';

import Api from 'components/api/api';
import type {InboxThread} from 'types/Inbox';
import type {MergedItem} from 'components/activity/activity__split-activities';
import type {MockStore} from 'redux-mock-store';

jest.mock('components/swipeable/swipeable');

let apiMock: Api;
let storeMock: MockStore;

const getApi = () => apiMock;

describe('InboxThreadItemSubscription', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    apiMock = {} as Api;
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
      let splittedActivitiesMock: MergedItem[];
      let module: {splitByHead: jest.Mock};
      beforeEach(() => {
        module = require('components/activity/activity__split-activities');
        splittedActivitiesMock = Array(4)
          .fill(0)
          .map((_, index) => ({
            head: {
              id: `id${index}`,
              author: mocks.createUserMock(),
            },
            messages: [{}],
          })) as MergedItem[];
        jest.spyOn(module, 'splitByHead');
      });
      it('should show button', () => {
        module.splitByHead.mockImplementationOnce(
          () => splittedActivitiesMock,
        );
        const {getByTestId} = renderAndGetMatcher();
        expect(
          getByTestId('test:id/inboxThreadsSubscriptionShowMore'),
        ).toBeTruthy();
      });
      it('should not show button', () => {
        module.splitByHead.mockImplementationOnce(() =>
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
});

function doRender(thread: InboxThread) {
  return render(
    <Provider store={storeMock}>
      <InboxThreadItemSubscription
        thread={thread}
        currentUser={mocks.createUserMock()}
        uiTheme={DEFAULT_THEME}
        onNavigate={jest.fn()}
      />
    </Provider>,
  );
}
