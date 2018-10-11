/* @flow */
import * as types from './inbox-action-types';
import {notifyError, resolveError} from '../../components/notification/notification';

export function setInboxLoading(loading) {
  return {type: types.SET_INBOX_LOADING, loading};
}

export function updateInbox(inbox) {
  return {type: types.UPDATE_INBOX, inbox};
}

export function loadInbox() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api = getApi();

    dispatch(setInboxLoading(true));

    try {
      const newInbox = await api.inbox.getInbox();

      dispatch(updateInbox(newInbox));
    } catch (err) {
      const error = await resolveError(err);
      notifyError('Cannot update inbox', error);
    }

    dispatch(setInboxLoading(false));
  };
}
