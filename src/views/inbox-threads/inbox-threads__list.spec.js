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

const threadTestId = 'test:id/inboxThreadsThread';

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

      expect(getByTestId('test:id/inboxThreads')).toBeTruthy();
    });

    it('should render thread item', () => {
      createStore(createThreadsData([threadsMock[0]]));
      const {getAllByTestId} = doRender();

      expect(getAllByTestId(threadTestId).length).toEqual(1);
    });

    it('should render all threads', () => {
      createStore(createThreadsData(threadsMock));
      const {getAllByTestId} = doRender();

      expect(getAllByTestId(threadTestId).length).toEqual(3);
    });

    it('should render `length - 1` threads if there are more threads to load', () => {
      createStore(createThreadsData(threadsMock, true));
      const {getAllByTestId} = doRender();

      expect(getAllByTestId(threadTestId).length).toEqual(2);
    });
  });


  function createThreadsData(threads = [], hasMore = false, key = folderIdAllKey) {
    return {[key]: {threads, hasMore}};
  }

  function createStore(threadsData = createThreadsData()) {
    const getApi = () => apiMock;
    const createStoreMock = mocks.createMockStore(getApi);
    const middlewares = [thunk.withExtraArgument(getApi)];
    storeMock = configureMockStore(middlewares);

    const stateMock = {
      app: {
        otherAccounts: [],
      },
      inboxThreads: {threadsData},
    };
    storeMock = createStoreMock(stateMock);
  }

  function doRender(folderId) {
    return render(
      <Provider store={storeMock}>
        <InboxThreadsList currentUser={mocks.createUserMock()} folderId={folderId} theme={DEFAULT_THEME}/>
      </Provider>
    );
  }

});
