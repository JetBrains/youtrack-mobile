/* @flow */

import * as types from './inbox-action-types';
import {createReducer} from 'redux-create-reducer';

import type {CustomError} from 'flow/Error';
import type {Theme} from 'flow/Theme';
import type {User} from 'flow/User';

export type InboxState = {
  loading: boolean,
  items: Array<Object>,
  hasMore: boolean,
  error: CustomError | null,
  theme: ?Theme,
  currentUser: ?User
};

const initialState: InboxState = {
  loading: false,
  hasMore: true,
  items: [],
  error: null,
  theme: null,
  currentUser: null,
};

export default (createReducer(initialState, {
  [types.SET_LOADING](state, {loading}): InboxState {
    return {...state, loading};
  },

  [types.ADD_ITEMS](state, {items, hasMore, issueLinkTypes}): InboxState {
    return {...state, items: [...state.items, ...items], hasMore, issueLinkTypes};
  },

  [types.RESET_ITEMS](state): InboxState {
    return {...state, items: [], hasMore: true};
  },

  [types.LIST_END_REACHED](state): InboxState {
    return {...state, hasMore: false};
  },

  [types.ERROR](state, {error}): InboxState {
    return {
      ...state,
      error,
    };
  },
}): any);
