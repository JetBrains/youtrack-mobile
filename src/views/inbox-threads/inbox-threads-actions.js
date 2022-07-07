/* @flow */

import usage from 'components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_THREADS_PAGE} from 'components/analytics/analytics-ids';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {folderIdAllKey} from './inbox-threads-helper';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from 'components/notification/notification';
import {setError, setNotifications, toggleProgress} from './inbox-threads-reducers';
import {until} from 'util/util';

import * as types from '../../actions/action-types';
import type Api from 'components/api/api';
import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxThread, InboxThreadMessage} from 'flow/Inbox';

type ApiGetter = () => Api;
type StateGetter = () => AppState;


const MAX_CACHED_THREADS: number = 10;

const loadThreadsFromCache = (folderId: string = folderIdAllKey): ((dispatch: (any) => any) => Promise<void>) => {
  return async (dispatch: (any) => any) => {
    const inboxThreadsCache: ?{ [string]: InboxThread[] } = getStorageState().inboxThreadsCache;
    if (inboxThreadsCache && inboxThreadsCache[folderId]) {
      dispatch(setNotifications({threads: inboxThreadsCache[folderId], reset: true, folderId}));
    }
  };
};

const updateThreadsCache = (threads: InboxThread[], folderId: string = folderIdAllKey): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    if (threads.length) {
      const inboxThreadsCache: ?{ [string]: InboxThread[] } = getStorageState().inboxThreadsCache;
      flushStoragePart({
        inboxThreadsCache: {
          ...inboxThreadsCache,
          [folderId]: threads.slice(0, MAX_CACHED_THREADS),
        },
      });
    }
  };
};

const loadInboxThreads = (folderId?: string, end?: number | null): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    if (isOffline) {
      return;
    }
    const api: Api = getApi();
    const isLoadingFirstTime: boolean = typeof end === 'undefined';
    if (isLoadingFirstTime) {
      usage.trackEvent(ANALYTICS_NOTIFICATIONS_THREADS_PAGE, 'Load inbox threads');
      dispatch(loadThreadsFromCache(folderId));
    }

    dispatch(setError({error: null}));
    dispatch(toggleProgress({inProgress: true}));
    const unreadOnly: ?boolean = getStorageState()?.inboxThreadsCache?.unreadOnly;
    const [error, threads]: [?CustomError, Array<InboxThread>] = await until(
      api.inbox.getThreads(folderId, end, unreadOnly)
    );
    dispatch(toggleProgress({inProgress: false}));

    if (error) {
      dispatch(setError({error}));
    } else {
      dispatch(setNotifications({threads, reset: typeof end !== 'number', folderId: folderId || folderIdAllKey}));
      dispatch(updateThreadsCache(threads, folderId));
      if (!folderId && isLoadingFirstTime) {
        dispatch(saveAllSeen(threads[0].notified));
        dispatch({
          type: types.INBOX_THREADS_HAS_UPDATE,
          hasUpdate: false,
        });
      }
    }
  };
};

const saveAllSeen = (lastSeen: number): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: () => Api) => {
    const api: Api = getApi();
    until(api.inbox.saveAllAsSeen(lastSeen));
  };
};

const muteToggle = (id: string, muted: boolean): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<boolean>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    if (isOffline) {
      return !muted;
    }
    const api: Api = getApi();
    const [error, inboxThread]: [?CustomError, Array<InboxThread>] = await until(api.inbox.muteToggle(id, muted));
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
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    if (isOffline) {
      return !read;
    }
    const api: Api = getApi();
    const [error, response]: [?CustomError, { read: boolean }] = await until(
      api.inbox.markMessages(
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
) => Promise<boolean>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    if (isOffline) {
      return;
    }
    const api: Api = getApi();
    const [error]: [?CustomError, { read: boolean }] = await until(api.inbox.markAllAsRead());
    if (error) {
      notifyError(error);
    } else {
      notify(i18n('Marked as read'));
    }
  };
};


export {
  loadInboxThreads,
  loadThreadsFromCache,
  markAllAsRead,
  muteToggle,
  readMessageToggle,
  updateThreadsCache,
};
