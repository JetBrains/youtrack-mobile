import React from 'react';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import {render, waitFor} from '@testing-library/react-native';

import Api from 'components/api/api';
import InboxThreadsList from './inbox-threads__list';
import mocks from 'test/mocks';
import {DEFAULT_THEME} from 'components/theme/theme';
import {folderIdAllKey} from './inbox-threads-helper';
import {ThemeContext} from 'components/theme/theme-context';

import type {MockStore} from 'redux-mock-store';
import {InboxThread, type ThreadsStateFilterId} from 'types/Inbox';

jest.mock('components/swipeable/swipeable');

let apiMock: Api;
jest.mock('components/api/api__instance', () => ({
  getApi: () => ({
    config: {
      backendUrl: '',
    },
    auth: {
      getAuthorizationHeaders: () => {},
    },
  }),
}));
const threadTestId = 'test:id/inboxThreadsListThread';
describe('Inbox Threads List', () => {
  let storeMock: MockStore;
  describe('Render', () => {
    let threadsMock: InboxThread[];
    beforeEach(() => {
      threadsMock = [
        mocks.createThreadMock(),
        mocks.createThreadMock({
          id: 'M-1',
        }),
        mocks.createThreadMock({
          id: 'R-1',
        }),
      ];
      createStore(createInboxThreadsData(undefined, threadsMock));
    });
    it('should render Inbox Threads view', () => {
      const {getByTestId} = doRender();
      expect(getByTestId('test:id/inboxThreadsList')).toBeTruthy();
    });
    it('should render all threads', () => {
      const {getAllByTestId} = doRender();
      expect(getAllByTestId(threadTestId)).toHaveLength(3);
    });
    it('should render `length - 1` threads if there are more threads to load', () => {
      createStore(createInboxThreadsData(undefined, threadsMock, true));
      const {getAllByTestId} = doRender();
      expect(getAllByTestId(threadTestId)).toHaveLength(2);
    });
    it('should render error', async () => {
      createStore({
        inboxThreads: {
          error: new Error(),
        },
      });
      const {getByTestId} = doRender();
      await waitFor(() => {
        expect(getByTestId('test:id/inboxThreadsListError')).toBeDefined();
      });
    });
    describe('`No notifications message` render', () => {
      const emptyMessageTestId = 'test:id/inboxThreadsListEmptyMessage';
      it('should render the message if there is no any threads', async () => {
        prepareStore([]);
        const {getByTestId} = doRender();
        await waitFor(() => {
          expect(getByTestId(emptyMessageTestId)).toBeDefined();
        });
      });
      it('should not render the message if there are threads', async () => {
        prepareStore([threadsMock[0]]);
        const {getByTestId} = doRender();
        await waitFor(() => {
          expect(() => getByTestId(emptyMessageTestId)).toThrow();
        });
      });
      it('should not render the message if there is no any messages in threads', async () => {
        prepareStore([
          mocks.createThreadMock({
            messages: [],
          }),
        ]);
        const {getByTestId} = doRender();
        await waitFor(() => {
          expect(() => getByTestId(emptyMessageTestId)).toThrow();
        });
      });
      it('should not render the message if `inProgress` set to true', async () => {
        prepareStore([threadsMock[0]], true);
        const {getByTestId} = doRender();
        await waitFor(() => {
          expect(() => getByTestId(emptyMessageTestId)).toThrow();
        });
      });
      it('should not render the message if there is an error', async () => {
        prepareStore([], false, new Error());
        const {getByTestId} = doRender();
        await waitFor(() => {
          expect(() => getByTestId(emptyMessageTestId)).toThrow();
        });
      });
      it('should show text about no unread notifications', async () => {
        prepareStore([]);
        mocks.setStorage({
          inboxThreadsCache: {
            unreadOnly: true,
          },
        });
        const {queryByTestId} = doRender();
        expect(
          queryByTestId('test:id/inboxThreadsListEmptyMessageText'),
        ).toHaveTextContent('You don’t have any unread notifications');
      });
      it('should show text about no notifications', async () => {
        prepareStore([]);
        mocks.setStorage({
          inboxThreadsCache: {
            unreadOnly: false,
          },
        });
        const {queryByTestId} = doRender();
        expect(
          queryByTestId('test:id/inboxThreadsListEmptyMessageText'),
        ).toHaveTextContent('No notifications');
      });

      function prepareStore(threads: InboxThread[], inProgress = false, error: Error | null = null) {
        createStore({
          inboxThreads: {
            threadsData: {
              [folderIdAllKey]: {
                threads,
              },
            },
            inProgress,
            error,
          },
        });
      }
    });
  });

  function createInboxThreadsData(
    key: ThreadsStateFilterId | null = folderIdAllKey,
    threads: InboxThread[],
    hasMore = false,
  ) {
    return {
      inboxThreads: {
        threadsData: {
          [key as string]: {
            threads,
            hasMore,
          },
        },
      },
    };
  }

  function createStore(data: {}) {
    const getApi = () => apiMock;

    const createStoreMock = mocks.createMockStore(getApi);
    const middlewares = [thunk.withExtraArgument(getApi)];
    storeMock = configureMockStore(middlewares) as unknown as MockStore;
    const stateMock = {
      app: {
        otherAccounts: [],
      },
      ...data,
    };
    storeMock = createStoreMock(stateMock);
  }

  function doRender(folderId: ThreadsStateFilterId | null = null) {
    return render(
      <Provider store={storeMock}>
        <ThemeContext.Provider value={DEFAULT_THEME}>
          <InboxThreadsList folderId={folderId} onNavigate={() => null} />
        </ThemeContext.Provider>
      </Provider>,
    );
  }
});
