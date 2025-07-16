import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import {render, waitFor} from '@testing-library/react-native';
import InboxThreadsList from './inbox-threads__list';
import mocks from '../../../test/mocks';
import {DEFAULT_THEME} from 'components/theme/theme';
import {folderIdAllKey} from './inbox-threads-helper';
import {ThemeContext} from 'components/theme/theme-context';

jest.mock('components/swipeable/swipeable');

let apiMock;
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
  let storeMock;
  describe('Render', () => {
    let threadsMock;
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
      const {getAllByTestId} = doRender(undefined, threadsMock, true);
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
    it('should render progress placeholder', async () => {
      createStore({
        inboxThreads: {
          inProgress: true,
        },
      });
      const {getByTestId} = doRender();
      await waitFor(() => {
        expect(getByTestId('test:id/inboxThreadsProgress')).toBeDefined();
      });
    });
    it('should not render progress placeholder if an error occured', async () => {
      createStore({
        inboxThreads: {
          inProgress: true,
        },
      });
      const {getByTestId} = doRender();
      await waitFor(() => {
        expect(getByTestId('test:id/inboxThreadsProgress')).toBeDefined();
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

      function prepareStore(threads, inProgress = false, error) {
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
    key = folderIdAllKey,
    threads = [],
    hasMore = false,
  ) {
    return {
      inboxThreads: {
        threadsData: {
          [key]: {
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
    storeMock = configureMockStore(middlewares);
    const stateMock = {
      app: {
        otherAccounts: [],
      },
      ...data,
    };
    storeMock = createStoreMock(stateMock);
  }

  function doRender(folderId) {
    return render(
      <Provider store={storeMock}>
        <ThemeContext.Provider value={DEFAULT_THEME}>
          <InboxThreadsList folderId={folderId} onNavigate={() => null} />
        </ThemeContext.Provider>
      </Provider>,
    );
  }
});
