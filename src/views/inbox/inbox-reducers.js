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
  [types.SET_LOADING](state, {loading}): InboxState {
    return {...state, loading};
  },

  [types.ADD_ITEMS](state, {items, hasMore}): InboxState {
    return {...state, items: [...state.items, ...items], hasMore};
  },

  [types.RESET_ITEMS](state): InboxState {
    return {...state, items: [], hasMore: true};
  },

  [types.LIST_END_REACHED](state): InboxState {
    return {...state, hasMore: false};
  }
});
