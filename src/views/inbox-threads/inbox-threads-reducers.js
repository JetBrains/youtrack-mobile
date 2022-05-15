/* @flow */

import {createSlice} from '@reduxjs/toolkit';
import type {CustomError} from 'flow/Error';
import type {InboxThread} from '../../flow/Inbox';

export interface InboxThreadState {
  error: CustomError | null,
  hasMore: boolean,
  threads: Array<InboxThread>,
  inProgress: boolean,
}

const initialState: InboxThreadState = {
  error: null,
  hasMore: false,
  threads: [],
  inProgress: false,
};

export interface NotificationsActions {
  setNotifications: (action: { threads: Array<InboxThread> }) => InboxThreadState,
  setError: (action: { error: CustomError | null }) => InboxThreadState,
  toggleProgress: (action: { inProgress: boolean }) => InboxThreadState,
}


const {reducer, actions}: { reducer: any, actions: NotificationsActions } = createSlice({
  name: 'inboxThreads',
  initialState: initialState,
  reducers: {
    setNotifications: (state: InboxThreadState, action: { payload: { threads: Array<InboxThread> } }) => {
      state.threads = action.payload.threads;
    },
    setError: (state: InboxThreadState, action: { payload: { error: CustomError } }) => {
      state.error = action.payload.error;
    },
    toggleProgress: (state: InboxThreadState, action: { payload: { inProgress: boolean } }) => {
      state.inProgress = action.payload.inProgress;
    },
  },
});


export const {
  setNotifications,
  toggleProgress,
  setError,
  } = actions;

export default reducer;
