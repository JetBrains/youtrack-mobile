import configureMockStore from 'redux-mock-store';
import mocks from 'test/mocks';
import thunk from 'redux-thunk';

import * as actions from './inbox-threads-actions';
import * as storage from 'components/storage/storage';

import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';
import {
  inboxThreadsNamespace,
  inboxThreadsReducersNamesMap,
} from './inbox-threads-reducers';
import {
  INBOX_THREADS_FOLDER_SEEN,
  SET_PROGRESS,
} from 'actions/action-types';
import {Store} from 'redux';


describe('Inbox Threads', () => {
  let apiMock: {};
  let responseMock: {};
  let store: Store;
  let threadMock: {};

  const getApi = () => apiMock;

  const middlewares = [thunk.withExtraArgument(getApi)];
  const storeMock = configureMockStore(middlewares);
  beforeEach(() => {
    jest.restoreAllMocks();
    threadMock = {
      subject: {
        target: {},
      },
    };
    responseMock = [threadMock];
    apiMock = {
      inbox: {
        getThreads: jest.fn().mockResolvedValue(responseMock),
        updateFolders: jest.fn().mockResolvedValue({}),
        saveAllAsSeen: jest.fn().mockResolvedValue({}),
      },
      articles: {
        addCommentReaction: jest.fn().mockResolvedValue({}),
        removeCommentReaction: jest.fn().mockResolvedValue({}),
      },
      issue: {
        addCommentReaction: jest.fn().mockResolvedValue({}),
        removeCommentReaction: jest.fn().mockResolvedValue({}),
      },
    };
    createStore(true);

    storage.__setStorageState({});
  });


  describe('loadInboxThreads', () => {
    it('should load inbox threads for the first time', async () => {
      await store.dispatch(
        actions.loadInboxThreads(undefined, undefined, false),
      );
      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(
        undefined,
        undefined,
        false,
      );
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
          type: INBOX_THREADS_FOLDER_SEEN,
          folderId: folderIdMap[1],
          lastSeen: 0,
        },
        {
          type: INBOX_THREADS_FOLDER_SEEN,
          folderId: folderIdMap[2],
          lastSeen: 0,
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
      await store.dispatch(
        require('./inbox-threads-actions').loadInboxThreads(undefined, 1, true),
      );
      expect(store.getActions()[2]).toEqual({
        type: SET_PROGRESS,
        isInProgress: true,
      });
      expect(store.getActions()[4]).toEqual({
        type: SET_PROGRESS,
        isInProgress: false,
      });
    });
    it('should load more threads', async () => {
      await store.dispatch(actions.loadInboxThreads(undefined, 1));
      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(
        undefined,
        1,
        false,
      );
      expect(store.getActions()[5]).toEqual({
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
      expect(store.getActions()[5]).toEqual({
        type: `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
        payload: {
          folderId: folderIdAllKey,
          threads: responseMock,
          reset: false,
        },
      });
    });


    describe('Mark and save a folder as seen', () => {
      let folderId;
      let lastKnownNotified;
      beforeEach(() => {
        folderId = folderIdMap[1];
        lastKnownNotified = 10;
        prepareStore([
          {
            id: folderId,
            lastNotified: lastKnownNotified,
            lastSeen: 1,
          },
        ]);
        apiMock.inbox.updateFolders.mockResolvedValueOnce({});
        apiMock.inbox.saveAllAsSeen.mockResolvedValueOnce({});
      });
      describe('saveFolderSeen', () => {
        it('should send request to mark one folder as seen', async () => {
          await store.dispatch(actions.loadInboxThreads(folderId));
          expect(apiMock.inbox.updateFolders).toHaveBeenCalledWith(folderId, {
            lastSeen: lastKnownNotified,
          });
        });
        it('should send request to mark all folders as seen', async () => {
          await store.dispatch(
            actions.saveFolderSeen(folderIdMap[0], lastKnownNotified),
          );
          expect(apiMock.inbox.saveAllAsSeen).toHaveBeenCalledWith(
            lastKnownNotified,
          );
        });
      });


      describe('markFolderSeen', () => {
        it('should update folder`s lastSeen in the state', async () => {
          await store.dispatch(
            actions.markFolderSeen(folderIdMap[0], lastKnownNotified),
          );
          expect(store.getActions()).toHaveLength(1);
          expect(store.getActions()[0]).toEqual({
            type: INBOX_THREADS_FOLDER_SEEN,
            folderId: folderIdMap[0],
            lastSeen: lastKnownNotified,
          });
        });
        it('should set maximal lastSeen for `All` notifications in the state', async () => {
          prepareStore([
            {
              id: folderIdMap[1],
              lastNotified: lastKnownNotified,
              lastSeen: 1,
            },
            {
              id: folderIdMap[2],
              lastNotified: lastKnownNotified + 1,
              lastSeen: 1,
            },
          ]);
          await store.dispatch(actions.markFolderSeen(folderIdMap[0]));
          expect(store.getActions()).toHaveLength(1);
          expect(store.getActions()[0]).toEqual({
            type: INBOX_THREADS_FOLDER_SEEN,
            folderId: folderIdMap[0],
            lastSeen: lastKnownNotified + 1,
          });
        });
        it('should set provided lastSeen date', async () => {
          prepareStore([
            {
              id: folderIdMap[1],
              lastNotified: 0,
              lastSeen: 1,
            },
            {
              id: folderIdMap[2],
              lastNotified: 1,
              lastSeen: 1,
            },
          ]);
          await store.dispatch(actions.markFolderSeen(folderIdMap[1], 123));
          expect(store.getActions()).toHaveLength(1);
          expect(store.getActions()[0]).toEqual({
            type: INBOX_THREADS_FOLDER_SEEN,
            folderId: folderIdMap[1],
            lastSeen: 123,
          });
        });
        it('should set lastSeen to `0` for any folder', async () => {
          prepareStore([]);
          await store.dispatch(actions.markFolderSeen(folderIdMap[1]));
          expect(store.getActions()).toHaveLength(1);
          expect(store.getActions()[0]).toEqual({
            type: INBOX_THREADS_FOLDER_SEEN,
            folderId: folderIdMap[1],
            lastSeen: 0,
          });
        });
        it('should set lastSeen to `0` for `All`', async () => {
          prepareStore([]);
          await store.dispatch(actions.markFolderSeen(folderIdMap[0]));
          expect(store.getActions()).toHaveLength(1);
          expect(store.getActions()[0]).toEqual({
            type: INBOX_THREADS_FOLDER_SEEN,
            folderId: folderIdMap[0],
            lastSeen: 0,
          });
        });
      });

      function prepareStore(inboxThreadFolders = [], id = folderId) {
        createStore(true, inboxThreadFolders, {
          threadsData: {
            [id]: {
              threads: [
                {
                  notified: lastKnownNotified,
                },
              ],
            },
          },
        });
      }
    });


    describe('onReactionSelect', () => {
      let onAfterSelectCallback;
      let issueMock;
      let articleMock;
      let commentMock;
      let commentMock2;
      let userMock;
      const reactionMock = {
        reaction: 'thumb',
        id: 'reactionId',
        author: {},
      };
      beforeEach(() => {
        issueMock = mocks.createIssueMock();
        articleMock = mocks.createArticleMock();
        commentMock = mocks.createCommentMock();
        userMock = mocks.createUserMock();
        commentMock2 = {
          ...commentMock,
          reactions: [
            {
              reaction: '1',
              author: {
                id: 0,
              },
            },
            {...reactionMock, author: userMock},
          ],
        };
        onAfterSelectCallback = jest.fn();
      });

      function setStore() {
        store = storeMock({
          app: {
            networkState: {
              isConnected: true,
            },
            user: userMock,
          },
        });
      }

      async function doSelect(_entity, comment) {
        await store.dispatch(
          actions.onReactionSelect(
            _entity,
            comment,
            reactionMock,
            onAfterSelectCallback,
          ),
        );
      }

      it('should add a reaction to an issue comment', async () => {
        await doSelect(issueMock, commentMock);
        expect(apiMock.issue.addCommentReaction).toHaveBeenCalledWith(
          issueMock.id,
          commentMock.id,
          reactionMock.reaction,
        );
      });
      it('should remove a reaction from an issue comment', async () => {
        setStore();
        await doSelect(issueMock, commentMock2);
        expect(apiMock.issue.removeCommentReaction).toHaveBeenCalledWith(
          issueMock.id,
          commentMock.id,
          reactionMock.id,
        );
      });
      it('should add a reaction to an article comment', async () => {
        await doSelect(articleMock, commentMock);
        expect(apiMock.articles.addCommentReaction).toHaveBeenCalledWith(
          articleMock.id,
          commentMock.id,
          reactionMock.reaction,
        );
      });
      it('should remove a reaction from an article comment', async () => {
        setStore();
        await doSelect(articleMock, commentMock2);
        expect(apiMock.articles.removeCommentReaction).toHaveBeenCalledWith(
          articleMock.id,
          commentMock.id,
          reactionMock.id,
        );
      });
      it('should mark folder seen after add/remove a reaction', async () => {
        await doSelect(articleMock, commentMock);
        expect(apiMock.inbox.updateFolders).toHaveBeenCalledWith(
          folderIdMap[1],
          {
            lastSeen: expect.any(Number),
          },
        );
      });
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
        apiMock.inbox.getThreads.mockResolvedValueOnce([threadMock, threadMock]);
        await store.dispatch(actions.loadInboxThreads(undefined, undefined));
        expect(
          storage.getStorageState().inboxThreadsCache[folderIdAllKey],
        ).toHaveLength(2);
      });
      it('should update inbox threads `Mentions & Reactions` tab cache', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([threadMock, threadMock, threadMock]);
        await store.dispatch(actions.loadInboxThreads(folderIdMap[1]));
        expect(
          storage.getStorageState().inboxThreadsCache[folderIdMap[1]],
        ).toHaveLength(3);
      });
      it('should update inbox threads `Subscriptions` tab cache', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([threadMock, threadMock, threadMock, threadMock]);
        await store.dispatch(actions.loadInboxThreads(folderIdMap[2]));
        expect(
          storage.getStorageState().inboxThreadsCache[folderIdMap[2]],
        ).toHaveLength(4);
      });
      it('should not set threads from the cache before loading for the  first time', async () => {
        apiMock.inbox.getThreads.mockResolvedValueOnce([threadMock, threadMock, threadMock]);
        const threadsMock = [{}, {}];

        storage.__setStorageState({
          inboxThreadsCache: {
            [folderIdMap[1]]: threadsMock,
          },
        });

        await store.dispatch(actions.loadInboxThreads(folderIdMap[1], 1));
        expect(store.getActions()[0].type).not.toEqual(
          `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
        );
      });
      it('should mark a folder as seen after loading threads', async () => {
        await store.dispatch(actions.loadInboxThreads(folderIdMap[1]));
        expect(apiMock.inbox.updateFolders).toHaveBeenCalledWith(
          folderIdMap[1],
          {
            lastSeen: expect.any(Number),
          },
        );
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
        messages: threadMocks[1].messages.reduce(
          (msgs, m) => msgs.concat({...m, read: true}),
          [],
        ),
      };
    });
    it('should not update the threads state and a cache', async () => {
      prepareStoreAndCacheData(folderIdAllKey, 1);
      await store.dispatch(
        actions.updateThreadsStateAndCache(updatedThread, false),
      );
      expect(store.getActions()).toHaveLength(0);
      expect(storage.flushStoragePart).not.toHaveBeenCalled();
    });
    it('should update the threads state and a cache for All notifications', async () => {
      prepareStoreAndCacheData(folderIdAllKey, 0);
      await store.dispatch(
        actions.updateThreadsStateAndCache(updatedThread, false),
      );
      expect(store.getActions()).toHaveLength(1);
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
      await store.dispatch(
        actions.updateThreadsStateAndCache(updatedThread, false),
      );
      expect(store.getActions()).toHaveLength(1);
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

  function createStore(
    isConnected = true,
    inboxThreadsFolders = [],
    inboxThreads = {},
  ) {
    store = storeMock({
      ...{
        inboxThreads,
      },
      app: {
        networkState: {
          isConnected,
        },
        inboxThreadsFolders,
      },
    });
  }
});
