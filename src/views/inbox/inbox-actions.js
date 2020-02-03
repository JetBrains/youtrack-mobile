/* @flow */
import * as types from './inbox-action-types';
import {notify, resolveError} from '../../components/notification/notification';
import log from '../../components/log/log';

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

export function loadInbox(skip: number = 0, top: number = 10) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api = getApi();

    dispatch(setLoading(true));

    try {
      const newItems = await api.inbox.getInbox(skip, top);

      if (!skip) {
        dispatch(resetItems());
      }

      dispatch(addItems(newItems.filter(item => item.metadata), newItems.length > 0));

      if (newItems.length < top) {
        dispatch(listEndReached());
      }
    } catch (err) {
      const error = await resolveError(err);
      const msg = 'Cannot update Inbox.';
      log.info(msg, error);
      notify(`${msg} Server in unavailable. Try later.`);
    }

    dispatch(setLoading(false));
  };
}
