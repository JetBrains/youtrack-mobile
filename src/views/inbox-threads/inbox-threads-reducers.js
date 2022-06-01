/* @flow */

import {createSlice} from '@reduxjs/toolkit';
import {threadsPageSize} from 'components/api/api__inbox';

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
  setNotifications: (action: { threads: InboxThread[], reset?: boolean }) => InboxThreadState,
  setError: (action: { error: CustomError | null }) => InboxThreadState,
  toggleProgress: (action: { inProgress: boolean }) => InboxThreadState,
}


export const inboxThreadsNamespace = 'inboxThreads';
export const inboxThreadsReducersNamesMap = {
  setNotifications: 'setNotifications',
  setError: 'setError',
  toggleProgress: 'toggleProgress',
};

const {reducer, actions}: { reducer: any, actions: NotificationsActions } = createSlice({
  name: inboxThreadsNamespace,
  initialState: initialState,
  reducers: {
    [inboxThreadsReducersNamesMap.setNotifications]: (
      state: InboxThreadState,
      action: { payload: { threads: InboxThread[], reset?: boolean } }
    ) => {
      state.threads = action.payload.reset ? action.payload.threads : state.threads.concat(action.payload.threads);
      state.hasMore = action.payload.threads.length === threadsPageSize;
    },
    [inboxThreadsReducersNamesMap.setError]: (
      state: InboxThreadState,
      action: { payload: { error: CustomError | null } }
    ) => {
      state.error = action.payload.error;
    },
    [inboxThreadsReducersNamesMap.toggleProgress]: (
      state: InboxThreadState,
      action: { payload: { inProgress: boolean } }
    ) => {
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
