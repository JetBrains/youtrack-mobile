/* @flow */

import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_THREADS_PAGE} from 'components/analytics/analytics-ids';
import {flushStoragePart, getStorageState, InboxThreadsCache} from 'components/storage/storage';
import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {INBOX_THREADS_FOLDER_SEEN, SET_PROGRESS} from '../../actions/action-types';
import {notify, notifyError} from 'components/notification/notification';
import {setError, setNotifications, toggleProgress} from './inbox-threads-reducers';
import {ThreadsStateData} from './inbox-threads-reducers';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxFolder, InboxThread, InboxThreadMessage, ThreadEntity} from 'flow/Inbox';
import type {Reaction} from 'flow/Reaction';
import type {User} from 'flow/User';
import type {IssueComment} from '../../flow/CustomFields';

type ApiGetter = () => Api;
type StateGetter = () => AppState;


const MAX_CACHED_THREADS: number = 10;
const DEFAULT_CACHE_DATA = {
  lastVisited: 0,
  unreadOnly: false,
};

const trackEvent = (event: string, params?: Object) => {
  usage.trackEvent(
    ANALYTICS_NOTIFICATIONS_THREADS_PAGE,
    `Inbox threads: ${event}`,
    params
  );
};

const setGlobalInProgress = (isInProgress: boolean) => ({
  type: SET_PROGRESS,
  isInProgress,
});

const getCachedData = (): InboxThreadsCache => {
  const inboxThreadsCache: ?InboxThreadsCache = getStorageState().inboxThreadsCache;
  return inboxThreadsCache || DEFAULT_CACHE_DATA;
};

const getFolderCachedThreads = (folderId: string = folderIdAllKey): InboxThread[] => {
  const cachedData = getCachedData();
  return cachedData[folderId] || [];
};

const isOnline = (state: AppState): boolean => state?.app?.networkState?.isConnected === true;

const updateCache = async (data: Object): Promise<void> => {
  await flushStoragePart({
    inboxThreadsCache: {
      ...DEFAULT_CACHE_DATA,
      ...getCachedData(),
      ...data,
    },
  });
};

const updateThreadsStateAndCache = (thread: InboxThread, setThreadRead: boolean) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const storedFolderIds: string[] = [folderIdAllKey, folderIdMap[2]];
    if (lastVisitedTabIndex() !== 1) {
      const updatedState: ThreadsStateData = updateState();
      const updatedCacheData: $Shape<InboxThreadsCache> = storedFolderIds.reduce(
        (map: $Shape<InboxThreadsCache>, folderId: string) => {
          return Object.assign(
            map,
            (updatedState[folderId]
              ? {[folderId]: updatedState[folderId].threads || getCachedData()[folderId]}
              : {})
          );
        },
        {}
      );
      updateCache(updatedCacheData);
    }

    function updateState(): ThreadsStateData {
      const unreadOnly: boolean = getCachedData().unreadOnly;
      const threadsData: ThreadsStateData = getState()?.inboxThreads?.threadsData;
      return storedFolderIds.reduce((map: ThreadsStateData, folderId: string) => {
        let data = {};
        if (threadsData[folderId]) {
          const threads: InboxThread[] = threadsData[folderId].threads.reduce(
            (list: InboxThread[], it: InboxThread) => list.concat(
              (thread.id === it.id
                ? (
                  unreadOnly && setThreadRead
                    ? []
                    : unreadOnly ? {...thread, messages: thread.messages.filter((it: InboxThread) => !it.read)} : thread
                )
                : it)
            ),
            []
          );
          dispatch(setNotifications({threads, reset: true, folderId}));
          data = {
            [folderId]: {
              ...threadsData[folderId],
              threads,
            },
          };
        }

        return {...map, ...data};
      }, {});
    }
  };
};

const loadThreadsFromCache = (folderId: string = folderIdAllKey): ((dispatch: (any) => any) => Promise<void>) => {
  return async (dispatch: (any) => any) => {
    const cachedThreads: InboxThread[] = getFolderCachedThreads(folderId);
    if (cachedThreads?.length) {
      dispatch(setNotifications({threads: cachedThreads, reset: true, folderId}));
    }
  };
};

const lastVisitedTabIndex = (index?: number): number => {
  const hasIndex: boolean = typeof index === 'number';
  if (hasIndex) {
    updateCache({lastVisited: index});
  }
  const lastVisited: number = hasIndex ? index : getCachedData().lastVisited;
  trackEvent(hasIndex ? 'visit tab' : 'load tab', {lastVisited});
  return lastVisited;
};

const toggleUnreadOnly = async (): Promise<void> => {
  const inboxThreadsCache: InboxThreadsCache = getCachedData();
  trackEvent('set unreadOnly', {unreadOnly: !inboxThreadsCache.unreadOnly});
  await updateCache({unreadOnly: !inboxThreadsCache.unreadOnly});
};

const isUnreadOnly = (): boolean => getCachedData().unreadOnly === true;

const saveFolderSeen = (folderId?: string, lastSeen: number): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const all: boolean = folderId === folderIdMap[0];
    trackEvent('mark folder seen', {all});
    if (isOnline(getState())) {
      const api: Api = getApi();
      const [error] = await until(
        all ? api.inbox.saveAllAsSeen(lastSeen) : api.inbox.updateFolders(folderId, {lastSeen})
      );
      if (error) {
        log.warn(error);
      }
    }
  };
};

const setFolderSeen = (folderId?: string, date?: number): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<?number>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const inboxThreadsFolders: InboxFolder[] = getState().app?.inboxThreadsFolders || [];
    const lastNotified: number = typeof date === 'number' ? date : (
      folderId
        ? inboxThreadsFolders.find(it => it.id === folderId)?.lastNotified || 0
        : Math.max.apply(null, inboxThreadsFolders.reduce(
          (numbers: number[], it: InboxFolder) => (
            numbers.concat(
              it.id === folderIdMap[1] || it.id === folderIdMap[2] ? it.lastNotified : -1
            )
          ), [0]))
    );
    if (typeof lastNotified === 'number') {
      dispatch({
        type: INBOX_THREADS_FOLDER_SEEN,
        folderId,
        lastSeen: lastNotified,
      });
    }
    return lastNotified;
  };
};

const markFolderSeen = (folderId?: string, date?: number): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    if (!isOnline(getState())) {
      return;
    }
    const lastNotified: ?number = await dispatch(setFolderSeen(folderId, date));
    if (typeof lastNotified === 'number') {
      dispatch(saveFolderSeen(folderId, Math.max(lastNotified, 0)));
    }
  };
};

const setInProgress = (inProgress: boolean, setGlobalProgress?: boolean): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch(toggleProgress({inProgress}));
    if (setGlobalProgress) {
      dispatch(setGlobalInProgress(inProgress));
    }
  };
};

const loadInboxThreads = (folderId?: string | null, end?: number, setGlobalProgress: boolean = false): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const reset: boolean = typeof end !== 'number';
    const folderKey: string = folderId || folderIdAllKey;

    if (reset) {
      usage.trackEvent(ANALYTICS_NOTIFICATIONS_THREADS_PAGE, 'Load inbox threads');
    }
    dispatch(setError({error: null}));

    if (!isOnline(getState())) {
      return;
    }

    dispatch(setInProgress(true, setGlobalProgress));
    const [error, threads]: [?CustomError, Array<InboxThread>] = await until(
      getApi().inbox.getThreads(folderId, end, isUnreadOnly())
    );
    dispatch(setInProgress(false, setGlobalProgress));

    if (error) {
      dispatch(setError({error}));
    } else {
      doMarkSeen();
      dispatch(setNotifications({
        threads,
        reset,
        folderId: folderKey,
      }));
      await updateCache({[folderId || folderIdAllKey]: threads.slice(0, MAX_CACHED_THREADS)});
    }

    async function doMarkSeen() {
      (folderId === folderIdMap[0] ? [folderIdMap[1], folderIdMap[2]] : [folderId]).forEach(
        (id: string) => dispatch(markFolderSeen(id))
      );
    }
  };
};

const muteToggle = (id: string, muted: boolean): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<boolean>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    trackEvent('mute thread', {muted});
    if (!isOnline(getState())) {
      return !muted;
    }
    const [error, inboxThread]: [?CustomError, Array<InboxThread>] = await until(getApi().inbox.muteToggle(id, muted));
    if (error) {
      notifyError(error);
      return !muted;
    } else {
      notify(inboxThread?.muted === true ? i18n('Thread muted') : i18n('Thread unmuted'));
      return error ? muted : inboxThread.muted;
    }
  };
};

const readMessageToggle = (messages: InboxThreadMessage[], read: boolean): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<void> => {
    trackEvent('mark message read', {read});
    if (!isOnline(getState())) {
      return;
    }
    const [error]: [?CustomError, { read: boolean }] = await until(
      getApi().inbox.markMessages(
        messages.map((it: InboxThreadMessage) => ({id: it.id})),
        read
      )
    );
    if (error) {
      notifyError(error);
    }
  };
};

const markAllAsRead = (index: number): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<void> => {
    trackEvent('Inbox threads: mark all as read');
    if (isOnline(getState())) {
      dispatch(toggleProgress({inProgress: true}));
      dispatch(setNotifications({
        threads: [],
        reset: true,
        folderId: folderIdMap[index],
      }));
      const [error]: [?CustomError, { read: boolean }] = await until(getApi().inbox.markAllAsRead());
      dispatch(toggleProgress({inProgress: false}));
      if (error) {
        notifyError(error);
      } else {
        notify(i18n('Marked as read'));
      }
    }
  };
};

const onReactionSelect = (entity: ThreadEntity, comment: IssueComment, reaction: Reaction, onAfterSelect: Function): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<void> => {
    const currentUser: User = getState().app.user;
    trackEvent('Inbox threads: make reaction');
    const reactionName: string = reaction.reaction;
    const existReaction: Reaction = (comment.reactions || []).filter(
      it => it.reaction === reactionName && it.author.id === currentUser.id
    )[0];
    const entityApi = hasType.article(entity) ? getApi().articles : getApi().issue;
    const [error, response] = await until(
      existReaction
        ? entityApi.removeCommentReaction(entity.id, comment.id, existReaction.id)
        : entityApi.addCommentReaction(entity.id, comment.id, reactionName)
    );
    if (error) {
      notifyError(error);
    } else {
      dispatch(markFolderSeen(folderIdMap[1], Date.now()));
      onAfterSelect(existReaction ? null : response, !!existReaction);
    }
  };
};


export {
  getFolderCachedThreads,
  isUnreadOnly,
  lastVisitedTabIndex,
  loadInboxThreads,
  loadThreadsFromCache,
  markAllAsRead,
  saveFolderSeen,
  markFolderSeen,
  muteToggle,
  onReactionSelect,
  readMessageToggle,
  setInProgress,
  toggleUnreadOnly,
  updateThreadsStateAndCache,
};