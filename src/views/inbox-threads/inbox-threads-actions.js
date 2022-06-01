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


const MAX_CACHED_THREADS: number = 30;

const setThreads = (threads: InboxThread[] | null, reset?: boolean): ((dispatch: (any) => any) => Promise<void>) => {
  return async (dispatch: (any) => any) => {
    if (threads && threads[0].subject) {
      dispatch(setNotifications({threads, reset}));
    }
  };
};

const loadInboxThreads = (end?: number): ((
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
    }

    dispatch(setError({error: null}));
    dispatch(setThreads(getStorageState().inboxCache));
    dispatch(toggleProgress({inProgress: true}));
    const [error, threads]: [?CustomError, Array<InboxThread>] = await until(api.inbox.getThreads(end));
    dispatch(toggleProgress({inProgress: false}));

    if (error) {
      dispatch(setError({error}));
    } else {
      const reset: boolean = typeof end !== 'number';
      dispatch(setThreads(threads, reset));
      const inboxCache: InboxThread[] = (reset ? threads : (getStorageState().inboxCache || []).concat(threads)).slice(0, MAX_CACHED_THREADS);
      flushStoragePart({inboxCache});
    }
  };
};


export default {
  loadInboxThreads,
};
