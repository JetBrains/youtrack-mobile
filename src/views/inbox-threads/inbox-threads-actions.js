/* @flow */

import usage from 'components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_THREADS_PAGE} from 'components/analytics/analytics-ids';
import {flushStoragePart, getStorageState, InboxThreadsCache} from 'components/storage/storage';
import {folderIdAllKey, folderIdMap} from './inbox-threads-helper';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from 'components/notification/notification';
import {setError, setNotifications, toggleProgress} from './inbox-threads-reducers';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxFolder, InboxThread, InboxThreadMessage} from 'flow/Inbox';
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

const getCachedData = (): InboxThreadsCache => getStorageState().inboxThreadsCache || DEFAULT_CACHE_DATA;

const getFolderCachedThreads = (folderId: string = folderIdAllKey): InboxThread[] => {
  return (getCachedData()[folderId] || []);
};

const isOnline = (state: AppState): boolean => state?.app?.networkState?.isConnected === true;

const updateCache = (data: Object) => {
  flushStoragePart({
    inboxThreadsCache: {
      ...DEFAULT_CACHE_DATA,
      ...getCachedData(),
      ...data,
    },
  });
};

const loadThreadsFromCache = (folderId: string = folderIdAllKey): ((dispatch: (any) => any) => Promise<void>) => {
  return async (dispatch: (any) => any) => {
    const inboxThreadsCache: InboxThreadsCache = getCachedData();
    if (inboxThreadsCache[folderId]) {
      dispatch(setNotifications({threads: inboxThreadsCache[folderId], reset: true, folderId}));
    }
  };
};

const lastVisitedTabIndex = (index?: number): number => {
  if (typeof index === 'number') {
    updateCache({lastVisited: index});
  }
  return getCachedData().lastVisited;
};

const toggleUnreadOnly = (): void => {
  const inboxThreadsCache: InboxThreadsCache = getCachedData();
  updateCache({unreadOnly: !inboxThreadsCache.unreadOnly});
};

const isUnreadOnly = (): boolean => getCachedData().unreadOnly;

const updateThreadsCache = (threads: InboxThread[] = [], folderId: string = folderIdAllKey): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    if (threads.length) {
      updateCache({[folderId]: threads.slice(0, MAX_CACHED_THREADS)});
    }
  };
};

const markFolderSeen = (folderId?: string, lastSeen: number): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<number | null>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    if (isOnline(getState())) {
      const api: Api = getApi();
      const all: boolean = folderId === folderIdMap[0];
      const [error, response] = await until(
        all ? api.inbox.saveAllAsSeen(lastSeen) : api.inbox.updateFolders(folderId, {lastSeen})
      );
      return error ? null : response.lastSeen;
    }
  };
};

const getLatestThreadByFolderId = (id: string = folderIdAllKey): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<?InboxThread>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const threadsData = getState()?.inboxThreads?.threadsData;
    const inboxThreadsCache = getStorageState().inboxThreadsCache;
    return (
      threadsData[id]?.threads && threadsData[id]?.threads[0] ||
      inboxThreadsCache && inboxThreadsCache[id] && inboxThreadsCache[id][0]
    );
  };
};

const markSeen = (folderId?: string): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const inboxThreadsFolders: InboxFolder[] = getState().app?.inboxThreadsFolders;
    if (!isOnline(getState()) || !inboxThreadsFolders.length) {
      return;
    }
    const latestThread: ?InboxThread = await dispatch(getLatestThreadByFolderId(folderId));
    if (latestThread) {
      await dispatch(markFolderSeen(folderId, latestThread.notified));
    }
  };
};

const loadInboxThreads = (folderId?: string | null, end?: number | null): ((
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

    if (end === undefined) {
      dispatch(loadThreadsFromCache(folderId));
    }
    if (!isOnline(getState())) {
      return;
    }

    dispatch(toggleProgress({inProgress: true}));
    const [error, threads]: [?CustomError, Array<InboxThread>] = await until(
      getApi().inbox.getThreads(folderId, end, isUnreadOnly())
    );
    dispatch(toggleProgress({inProgress: false}));

    if (error) {
      dispatch(setError({error}));
    } else {
      dispatch(setNotifications({
        threads,
        reset,
        folderId: folderKey,
      }));
      dispatch(markSeen(folderId));
      dispatch(updateThreadsCache(threads, folderId));
    }
  };
};

const muteToggle = (id: string, muted: boolean): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<boolean>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
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
) => Promise<boolean>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<boolean> => {
    if (!isOnline(getState())) {
      return !read;
    }
    const [error, response]: [?CustomError, { read: boolean }] = await until(
      getApi().inbox.markMessages(
        messages.map((it: InboxThreadMessage) => ({id: it.id})),
        read
      )
    );
    if (error) {
      notifyError(error);
      return !read;
    } else {
      notify(read === true ? i18n('Marked as read') : i18n('Marked as unread'));
      return error ? !read : response.read;
    }
  };
};

const markAllAsRead = (): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<void> => {
    if (isOnline(getState())) {
      const [error]: [?CustomError, { read: boolean }] = await until(getApi().inbox.markAllAsRead());
      if (error) {
        notifyError(error);
      } else {
        notify(i18n('Marked as read'));
      }
    }
  };
};

const onReactionSelect = (issueId: string, comment: IssueComment, reaction: Reaction, onAfterSelect: Function): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<void> => {
    const currentUser: User = getState().app.user;
    usage.trackEvent(ANALYTICS_NOTIFICATIONS_THREADS_PAGE, 'Reaction select');
    const reactionName: string = reaction.reaction;
    const existReaction: Reaction = (comment.reactions || []).filter(
      it => it.reaction === reactionName && it.author.id === currentUser.id
    )[0];
    const api: Api = getApi();
    const [error, response] = await until(
      existReaction
        ? api.issue.removeCommentReaction(issueId, comment.id, existReaction.id)
        : api.issue.addCommentReaction(issueId, comment.id, reactionName)
    );
    if (error) {
      notifyError(error);
    } else {
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
  markFolderSeen,
  markSeen,
  muteToggle,
  onReactionSelect,
  readMessageToggle,
  toggleUnreadOnly,
  updateThreadsCache,
};
