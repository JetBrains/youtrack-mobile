import React from 'react';

import {Provider} from 'react-redux';
import {render} from '@testing-library/react-native';

import configureMockStore from 'redux-mock-store';
import InboxThreadsList from './inbox-threads__list';
import mocks from '../../../test/mocks';
import thunk from 'redux-thunk';
import {DEFAULT_THEME} from 'components/theme/theme';
import {folderIdAllKey} from './inbox-threads-helper';

let apiMock;
jest.mock('components/api/api__instance', () => ({
  getApi: () => ({
    config: {backendUrl: ''},
    auth: {getAuthorizationHeaders: () => {}},
  }),
}));

const threadTestId = 'test:id/inboxThreadsListThread';

describe('Inbox Threads List', () => {

  let storeMock;
  beforeAll(() => {
    createStore();
  });

  describe('Render', () => {
    let threadsMock;
    beforeEach(() => {
      threadsMock = [
        mocks.createThreadMock(),
        mocks.createThreadMock({id: 'M-1'}),
        mocks.createThreadMock({id: 'R-1'}),
      ];
    });

    it('should render Inbox Threads view', () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/inboxThreadsList')).toBeTruthy();
    });

    it('should render thread item', () => {
      const {getAllByTestId} = doRender(undefined, threadsMock.slice(-1));

      expect(getAllByTestId(threadTestId).length).toEqual(1);
    });

    it('should render all threads', () => {
      const {getAllByTestId} = doRender(undefined, threadsMock);

      expect(getAllByTestId(threadTestId).length).toEqual(3);
    });

    it('should render `length - 1` threads if there are more threads to load', () => {
      const {getAllByTestId} = doRender(undefined, threadsMock, true);

      expect(getAllByTestId(threadTestId).length).toEqual(2);
    });
  });


  function createThreadsData(threads = [], hasMore = false, key = folderIdAllKey) {
    return {[key]: {threads, hasMore}};
  }

  function createStore() {
    const getApi = () => apiMock;
    const createStoreMock = mocks.createMockStore(getApi);
    const middlewares = [thunk.withExtraArgument(getApi)];
    storeMock = configureMockStore(middlewares);

    const stateMock = {
      app: {
        otherAccounts: [],
      },
      inboxThreads: {},
    };
    storeMock = createStoreMock(stateMock);
  }

  function doRender(folderId, threads = [], hasMore) {
    return render(
      <Provider store={storeMock}>
        <InboxThreadsList
          threadsData={createThreadsData(threads, hasMore)}
          currentUser={mocks.createUserMock()}
          folderId={folderId}
          theme={DEFAULT_THEME}
        />
      </Provider>
    );
  }

});
