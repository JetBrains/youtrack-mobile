/* @flow */
import * as types from './inbox-action-types';
import log from '../../components/log/log';

import usage from '../../components/usage/usage';
import {ANALYTICS_NOTIFICATIONS_PAGE} from '../../components/analytics/analytics-ids';
import {checkVersion} from '../../components/feature/feature';
import {flushStoragePart, getStorageState} from '../../components/storage/storage';
import {sortByTimestampReverse} from '../../components/search/sorting';
import {until} from '../../util/util';

import type Api from '../../components/api/api';
import type {CustomError} from '../../flow/Error';
import type {Notification} from '../../flow/Inbox';

type ApiGetter = () => Api;

export function setLoading(loading: boolean): {loading: boolean, type: any} {
  return {type: types.SET_LOADING, loading};
}

export function addItems(items: Array<Object>, hasMore: boolean): {hasMore: boolean, items: Array<any>, type: any} {
  return {type: types.ADD_ITEMS, items, hasMore};
}

export function resetItems(): {type: any} {
  return {type: types.RESET_ITEMS};
}

export function listEndReached(): {type: any} {
  return {type: types.LIST_END_REACHED};
}

export function setError(error: ?Error): {error: ?Error, type: any} {
  return {type: types.ERROR, error};
}

export function loadInboxCache(): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    const inboxCache: Array<Notification> | null = getStorageState().inboxCache;
    if (inboxCache) {
      dispatch(addItems(inboxCache, false));
    }
  };
}

export function loadInbox(skip: number = 0, top: number = 10): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void> | Promise<any>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api = getApi();

    dispatch(setError(null));
    dispatch(setLoading(true));

    const loadingErrorMessage: string = 'Cannot load Inbox.';
    const promises = [api.inbox.getInbox(skip, top)];
    const isReactionsAvailable: boolean = checkVersion('2020.1');
    if (isReactionsAvailable) {
      usage.trackEvent(ANALYTICS_NOTIFICATIONS_PAGE, 'Loading reaction feed');
      promises.push(api.user.reactionsFeed(skip, top));
    }

    const [error, notificationAndReactions] = await until(promises);

    if (error || notificationAndReactions.filter(Boolean).length === 0) {
      const err: CustomError = error || new Error(loadingErrorMessage);
      log.warn(loadingErrorMessage, err);
      return dispatch(setError(err));
    }

    const notifications = (
      (notificationAndReactions[0] || [])
        .filter(item => item.metadata)
        .map(it => (
          Object.assign(
            {},
            it,
            it?.metadata?.change?.startTimestamp ? {timestamp: it.metadata.change.startTimestamp} : {}
          )
        ))
    );
    const reactions = isReactionsAvailable ? notificationAndReactions && notificationAndReactions[1] : [];
    const sortedByTimestampItems = notifications.concat(reactions).sort(sortByTimestampReverse);

    if (!skip) {
      dispatch(resetItems());
    }

    dispatch(
      addItems(sortedByTimestampItems, notificationAndReactions[0].length > 0)
    );
    flushStoragePart({inboxCache: sortedByTimestampItems});

    if (notificationAndReactions[0].length < top) {
      dispatch(listEndReached());
    }

    dispatch(setLoading(false));
  };
}
