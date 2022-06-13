/* @flow */

import usage from 'components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_THREADS_PAGE} from 'components/analytics/analytics-ids';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {setError, setNotifications, toggleProgress} from './inbox-threads-reducers';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxThread} from 'flow/Inbox';

type ApiGetter = () => Api;
type StateGetter = () => AppState;


const MAX_CACHED_THREADS: number = 10;

const loadThreadsFromCache = (folderId?: string = 'all'): ((dispatch: (any) => any) => Promise<void>) => {
  return async (dispatch: (any) => any) => {
    const inboxThreadsCache = getStorageState().inboxThreadsCache;
    if (inboxThreadsCache && inboxThreadsCache[folderId]) {
      dispatch(setNotifications({threads: inboxThreadsCache[folderId], reset: true}));
    }
  };
};

const updateThreadsCache = (folderId?: string = 'all'): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) => {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const threads = getState().inboxThreads.threads;
    if (threads.length) {
      const inboxThreadsCache = getStorageState().inboxThreadsCache;
      flushStoragePart({
        inboxThreadsCache: {
          ...inboxThreadsCache,
          [folderId]: threads.slice(0, MAX_CACHED_THREADS),
        },
      });
    }
  };
};

const loadInboxThreads = (folderId?: string, end?: number): ((
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
    if (!end) {
      usage.trackEvent(ANALYTICS_NOTIFICATIONS_THREADS_PAGE, 'Load inbox threads');
      dispatch(loadThreadsFromCache(folderId));
    }

    dispatch(setError({error: null}));
    dispatch(toggleProgress({inProgress: true}));
    const [error, threads]: [?CustomError, Array<InboxThread>] = await until(api.inbox.getThreads(folderId, end));
    dispatch(toggleProgress({inProgress: false}));

    if (error) {
      dispatch(setError({error}));
    } else {
      dispatch(setNotifications({threads, reset: typeof end !== 'number'}));
      dispatch(updateThreadsCache(folderId));
    }
  };
};


export {
  loadInboxThreads,
  loadThreadsFromCache,
  updateThreadsCache,
};
