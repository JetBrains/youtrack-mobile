import actions from './inbox-threads-actions';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {__setStorageState, getStorageState} from '../../components/storage/storage';
import {inboxThreadsNamespace, inboxThreadsReducersNamesMap} from './inbox-threads-reducers';


describe('Inbox Threads', () => {
  let apiMock;
  let responseMock;
  let store;

  const getApi = () => apiMock;
  const middlewares = [thunk.withExtraArgument(getApi)];
  const storeMock = configureMockStore(middlewares);

  beforeEach(async () => {
    responseMock = [{subject: {}}];
    apiMock = {
      inbox: {
        getThreads: jest.fn(() => Promise.resolve(responseMock)),
      },
    };

    store = storeMock({});
    __setStorageState({});
  });

  describe('loadInboxThreads', () => {
    it('should load inbox threads for the first time', async () => {
      await store.dispatch(actions.loadInboxThreads());

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(undefined);
      expect(store.getActions()).toEqual([
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setError}`,
          payload: {
            error: null,
          },
        },
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.toggleProgress}`,
          payload: {
            inProgress: true,
          },
        },
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.toggleProgress}`,
          payload: {
            inProgress: false,
          },
        },
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
          payload: {
            threads: responseMock,
            reset: true,
          },
        },
      ]);
    });

    it('should load more threads', async () => {
      await store.dispatch(actions.loadInboxThreads(123));

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(123);
      expect(store.getActions()[3]).toEqual({
        type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
        payload: {
          threads: responseMock,
          reset: false,
        },
      });

    });

    it('should cache inbox threads for at the first load', async () => {
      __setStorageState({
        inboxCache: [{}, {}],
      });

      await store.dispatch(actions.loadInboxThreads());

      expect(getStorageState().inboxCache.length).toEqual(1);
    });

    it('should add threads to the cache', async () => {
      __setStorageState({
        inboxCache: [{}, {}],
      });

      await store.dispatch(actions.loadInboxThreads(1));

      expect(getStorageState().inboxCache.length).toEqual(3);
    });

  });
});
