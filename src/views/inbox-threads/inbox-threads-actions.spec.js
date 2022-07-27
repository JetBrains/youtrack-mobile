import * as actions from './inbox-threads-actions';
import * as storage from 'components/storage/storage';
import configureMockStore from 'redux-mock-store';
import mocks from '../../../test/mocks';
import thunk from 'redux-thunk';
import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';
import {inboxThreadsNamespace, inboxThreadsReducersNamesMap} from './inbox-threads-reducers';
import {SET_PROGRESS} from '../../actions/action-types';

describe('Inbox Threads', () => {
  let apiMock;
  let responseMock;
  let store;

  const getApi = () => apiMock;
  const middlewares = [thunk.withExtraArgument(getApi)];
  const storeMock = configureMockStore(middlewares);

  beforeEach(() => {
    jest.restoreAllMocks();
    responseMock = [{subject: {}}];
    apiMock = {
      inbox: {
        getThreads: jest.fn().mockResolvedValue(responseMock),
        updateFolders: jest.fn(),
        saveAllAsSeen: jest.fn(),
      },
    };

    createStore(true);

    storage.__setStorageState({});
  });


  describe('loadInboxThreads', () => {
    it('should load inbox threads for the first time', async () => {
      await store.dispatch(actions.loadInboxThreads());

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(undefined, undefined, false);
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
          type: SET_PROGRESS,
          isInProgress: false,
        },
        {
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
          payload: {
            folderId: folderIdAllKey,
            threads: responseMock,
            reset: true,
          },
        },
      ]);
    });

    it('should activate global `isInProgress`', async () => {
      await store.dispatch(require('./inbox-threads-actions').loadInboxThreads(undefined, 1, true));

      expect(store.getActions()[2]).toEqual({
        type: SET_PROGRESS,
        isInProgress: true,
      });
    });

    it('should load more threads', async () => {
      await store.dispatch(actions.loadInboxThreads(undefined, 1));

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(undefined, 1, false);
      expect(store.getActions()[4]).toEqual({
        type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
        payload: {
          folderId: folderIdAllKey,
          threads: responseMock,
          reset: false,
        },
      });
    });

    it('should load readOnly threads', async () => {
      storage.__setStorageState({
        ...storage.getStorageState(),
        inboxThreadsCache: {
          ...storage.getStorageState().inboxThreadsCache,
          unreadOnly: true,
        },
      });
      await store.dispatch(actions.loadInboxThreads(undefined, 1));

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(undefined, 1, true);
      expect(store.getActions()[4]).toEqual({
        type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
        payload: {
          folderId: folderIdAllKey,
          threads: responseMock,
          reset: false,
        },
      });
    });


    describe('Save as seen', () => {
      let folderId;
      let lastKnownNotified;
      beforeEach(() => {
        folderId = folderIdMap[1];
        lastKnownNotified = 10;

        prepareStore([{id: folderId, lastNotified: 1, lastSeen: 0}]);
        apiMock.inbox.updateFolders.mockResolvedValueOnce({lastSeen: 100});
        apiMock.inbox.saveAllAsSeen.mockResolvedValueOnce({});
      });

      it('should mark folder as seen', async () => {
        await store.dispatch(actions.loadInboxThreads(folderId));

        expect(apiMock.inbox.updateFolders).toHaveBeenCalledWith(folderId, {lastSeen: lastKnownNotified});
      });

      it('should mark all as seen', async () => {
        apiMock.inbox.saveAllAsSeen.mockResolvedValueOnce({});

        await store.dispatch(actions.markFolderSeen(folderIdMap[0], lastKnownNotified));

        expect(apiMock.inbox.saveAllAsSeen).toHaveBeenCalledWith(lastKnownNotified);
      });

      function prepareStore(inboxThreadFolders = [], id = folderId) {
        createStore(
          true,
          inboxThreadFolders,
          {
            threadsData: {
              [id]: {
                threads: [{notified: lastKnownNotified}],
              },
            },
          },
        );
      }
    });


    describe('Cache', () => {
      it('should set folder data from the cache', async () => {
        createStore(false);
        const threadsMock = [{}, {}];
        storage.__setStorageState({
          inboxThreadsCache: {
            [folderIdAllKey]: threadsMock,
          },
        });

        await store.dispatch(actions.loadThreadsFromCache(folderIdMap[0]));

        expect(store.getActions()[0]).toEqual({
          type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
          payload: {
            folderId: folderIdAllKey,
            threads: threadsMock,
            reset: true,
          },
        });
      });

      it('should update inbox threads `All` tab cache', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([{}, {}]);
        await store.dispatch(actions.loadInboxThreads(undefined, undefined));

        expect(storage.getStorageState().inboxThreadsCache[folderIdAllKey].length).toEqual(2);
      });

      it('should update inbox threads `Mentions & Reactions` tab cache', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([{}, {}, {}]);
        await store.dispatch(actions.loadInboxThreads(folderIdMap[1]));

        expect(storage.getStorageState().inboxThreadsCache[folderIdMap[1]].length).toEqual(3);
      });

      it('should update inbox threads `Subscriptions` tab cache', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([{}, {}, {}, {}]);
        await store.dispatch(actions.loadInboxThreads(folderIdMap[2]));

        expect(storage.getStorageState().inboxThreadsCache[folderIdMap[2]].length).toEqual(4);
      });

      it('should not set threads from the cache before loading for the  first time', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([{}, {}, {}]);
        const threadsMock = [{}, {}];
        storage.__setStorageState({
          inboxThreadsCache: {
            [folderIdMap[1]]: threadsMock,
          },
        });

        await store.dispatch(actions.loadInboxThreads(folderIdMap[1], 1));

        expect(store.getActions()[0].type).not.toEqual(
          `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`);

      });
    });

  });


  describe('updateThreadsStateAndCache', () => {
    let threadMocks;
    let updatedThread;
    let lastVisited;
    let unreadOnly;
    beforeEach(() => {
      jest.spyOn(storage, 'flushStoragePart');

      threadMocks = [mocks.createThreadMock(), mocks.createThreadMock()];
      lastVisited = 0;
      updatedThread = {
        ...threadMocks[1],
        messages: threadMocks[1].messages.reduce((msgs, m) => msgs.concat({...m, read: true}), []),
      };
    });

    it('should not update the threads state and a cache', async () => {
      prepareStoreAndCacheData(folderIdAllKey, 1);

      await store.dispatch(actions.updateThreadsStateAndCache(updatedThread, false));

      expect(store.getActions().length).toEqual(0);
      expect(storage.flushStoragePart).not.toHaveBeenCalled();
    });

    it('should update the threads state and a cache for All notifications', async () => {
      prepareStoreAndCacheData(folderIdAllKey, 0);

      await store.dispatch(actions.updateThreadsStateAndCache(updatedThread, false));

      expect(store.getActions().length).toEqual(1);
      expect(store.getActions()[0]).toEqual({
        payload: {
          folderId: folderIdAllKey,
          reset: true,
          threads: [threadMocks[0], updatedThread],
        },
        type: 'inboxThreads/setNotifications',
      });
      expect(storage.flushStoragePart).toHaveBeenCalledWith({
        inboxThreadsCache: {
          [folderIdAllKey]: [threadMocks[0], updatedThread],
          lastVisited,
          unreadOnly,
        },
      });
    });

    it('should update the threads state and a cache for Subscriptions notifications', async () => {
      prepareStoreAndCacheData(folderIdMap[2], 2);

      await store.dispatch(actions.updateThreadsStateAndCache(updatedThread, false));

      expect(store.getActions().length).toEqual(1);
      expect(store.getActions()[0]).toEqual({
        payload: {
          folderId: folderIdMap[2],
          reset: true,
          threads: [threadMocks[0], updatedThread],
        },
        type: 'inboxThreads/setNotifications',
      });
      expect(storage.flushStoragePart).toHaveBeenCalledWith({
        inboxThreadsCache: {
          [folderIdMap[2]]: [threadMocks[0], updatedThread],
          lastVisited: 2,
          unreadOnly,
        },
      });
    });

    function prepareStoreAndCacheData(folderId, tabIndex) {
      createStore(true, [], {
        threadsData: {
          [folderId]: {
            threads: threadMocks,
          },
        },
      });
      storage.__setStorageState({
        inboxThreadsCache: {
          lastVisited: tabIndex,
          unreadOnly,
        },
      });
    }
  });


  function createStore(isConnected = true, inboxThreadsFolders = [], inboxThreads = {}) {
    store = storeMock({
      ...{inboxThreads},
      app: {
        networkState: {isConnected},
        inboxThreadsFolders,
      },
    });
  }
});
