/* @flow */
import * as types from './inbox-action-types';
import log from '../../components/log/log';

import {checkVersion} from '../../components/feature/feature';
import {sortByTimestampReverse} from '../../components/search/sorting';
import {until} from '../../util/util';

import type Api from '../../components/api/api';

type ApiGetter = () => Api;

export function setLoading(loading: boolean) {
  return {type: types.SET_LOADING, loading};
}

export function addItems(items: Array<Object>, hasMore: boolean) {
  return {type: types.ADD_ITEMS, items, hasMore};
}

export function resetItems() {
  return {type: types.RESET_ITEMS};
}

export function listEndReached() {
  return {type: types.LIST_END_REACHED};
}

export function setError(error: ?Error) {
  return {type: types.ERROR, error};
}

export function loadInbox(skip: number = 0, top: number = 10) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api = getApi();

    dispatch(setError(null));
    dispatch(setLoading(true));

    try {
      const promises = [api.inbox.getInbox(skip, top)];
      const isReactionsAvailable: boolean = checkVersion('2020.1');
      if (isReactionsAvailable) {
        promises.push(api.user.reactionsFeed(skip, top));
      }

      // eslint-disable-next-line no-unused-vars
      const [error, notificationAndReactions] = await until(promises);

      const notifications = (
        notificationAndReactions[0]
          .filter(item => item.metadata)
          .map(it => (Object.assign({}, it, {timestamp: it.metadata.change.startTimestamp})))
      );
      const reactions = isReactionsAvailable ? notificationAndReactions[1] : [];
      const sortedByTimestampItems = notifications.concat(reactions).sort(sortByTimestampReverse);

      if (!skip) {
        dispatch(resetItems());
      }

      dispatch(
        addItems(sortedByTimestampItems, notificationAndReactions[0].length > 0)
      );

      if (notificationAndReactions[0].length < top) {
        dispatch(listEndReached());
      }
    } catch (error) {
      log.warn('Cannot load Inbox.', error);
      dispatch(setError(error));
    }

    dispatch(setLoading(false));
  };
}
