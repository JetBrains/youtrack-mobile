/* @flow */
import * as types from './inbox-action-types';
import {notifyError, resolveError} from '../../components/notification/notification';
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

export function loadInbox(skip?: number, top?: number) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api = getApi();

    dispatch(setLoading(true));

    try {
      const newItems = await api.inbox.getInbox(skip, top);

      if (!skip) {
        dispatch(resetItems());
      }

      dispatch(addItems(newItems, newItems.length > 0));
    } catch (err) {
      const error = await resolveError(err);
      notifyError('Cannot update inbox', error);
    }

    dispatch(setLoading(false));
  };
}
