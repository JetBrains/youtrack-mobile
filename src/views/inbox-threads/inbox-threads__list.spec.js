import React from 'react';

import {render} from '@testing-library/react-native';

import configureMockStore from 'redux-mock-store';
import InboxThreadsList from './inbox-threads__list';
import mocks from '../../../test/mocks';
import thunk from 'redux-thunk';
import {DEFAULT_THEME} from 'components/theme/theme';
import {Provider} from 'react-redux';

let apiMock;
jest.mock('components/api/api__instance', () => ({
  getApi: () => ({
    config: {backendUrl: ''},
    auth: {getAuthorizationHeaders: () => {}},
  }),
}));

describe('Inbox Threads', () => {

  let storeMock;
  beforeAll(() => {
    createStore();
  });

  describe('Render', () => {
    const threadTestId = 'test:id/inboxThreadsThread';
    let threadsMock;
    beforeEach(() => {
      threadsMock = [mocks.createThreadMock(), mocks.createThreadMock(), mocks.createThreadMock()];
    });

    it('should render Inbox Threads view', () => {
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/inboxThreads')).toBeTruthy();
    });

    it('should render thread item', () => {
      createStore(
        [threadsMock[0]],
        false
        );
      const {getAllByTestId} = doRender();

      expect(getAllByTestId(threadTestId).length).toEqual(1);
    });

    it('should render all threads', () => {
      createStore(
        threadsMock,
        false
      );
      const {getAllByTestId} = doRender();

      expect(getAllByTestId(threadTestId).length).toEqual(3);
    });

    it('should render `length - 1` threads if there are more threads to load', () => {
      createStore(
        threadsMock,
        true
      );
      const {getAllByTestId} = doRender();

      expect(getAllByTestId(threadTestId).length).toEqual(2);
    });
  });


  function createStore(threads = [], hasMore = false) {
    const getApi = () => apiMock;
    const createStoreMock = mocks.createMockStore(getApi);
    const middlewares = [thunk.withExtraArgument(getApi)];
    storeMock = configureMockStore(middlewares);

    const stateMock = {
      app: {
        otherAccounts: [],
      },
      inboxThreads: {
        threads,
        hasMore,
      },
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
