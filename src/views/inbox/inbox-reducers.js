/* @flow */
import {createReducer} from 'redux-create-reducer';
import * as types from './inbox-action-types';

export type InboxState = {
  loading: boolean,
  items: Array<Object>,
  hasMore: boolean
};

const initialState: InboxState = {
  loading: false,
  hasMore: true,
  items: []
};

export default createReducer(initialState, {
  [types.SET_INBOX_LOADING](state, {loading}): InboxState {
    return {...state, loading};
  },

  [types.UPDATE_INBOX](state, {items, hasMore}): InboxState {
    return {...state, items, hasMore};
  }
});
