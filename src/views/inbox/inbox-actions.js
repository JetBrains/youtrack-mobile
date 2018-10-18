/* @flow */
import * as types from './inbox-action-types';
import {notifyError, resolveError} from '../../components/notification/notification';
import type Api from '../../components/api/api';

type ApiGetter = () => Api;

export function setInboxLoading(loading: boolean) {
  return {type: types.SET_INBOX_LOADING, loading};
}

export function updateInbox(items: Array<Object>, hasMore: boolean) {
  return {type: types.UPDATE_INBOX, items, hasMore};
}

export function loadInbox(skip?: number, top?: number) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api = getApi();
    const state = getState();

    dispatch(setInboxLoading(true));

    try {
      const oldItems = state.inbox.items;
      const newItems = await api.inbox.getInbox(skip, top);

      dispatch(updateInbox(
        !skip ? [...newItems] : [...oldItems, ...newItems],
        newItems.length > 0
      ));
    } catch (err) {
      const error = await resolveError(err);
      notifyError('Cannot update inbox', error);
    }

    dispatch(setInboxLoading(false));
  };
}
