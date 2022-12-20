import {createSlice} from '@reduxjs/toolkit';
import {threadsPageSize} from 'components/api/api__inbox';
import type {CustomError} from 'flow/Error';
import type {InboxThread, ThreadsStateDataKey} from 'flow/Inbox';
export type ThreadsStateData = Record<
  ThreadsStateDataKey,
  {
    threads: InboxThread[];
    hasMore: boolean;
  }
>;
export type InboxThreadState = {
  error: CustomError | null;
  threadsData: ThreadsStateData;
  inProgress: boolean;
};
const initialState: InboxThreadState = {
  error: null,
  threadsData: {},
  inProgress: false,
};
export interface NotificationsActions {
  setNotifications: (action: {
    threads: InboxThread[];
    reset?: boolean;
    folderId: string;
  }) => InboxThreadState;
  setError: (action: {error: CustomError | null}) => InboxThreadState;
  toggleProgress: (action: {inProgress: boolean}) => InboxThreadState;
}
export const inboxThreadsNamespace = 'inboxThreads';
export const inboxThreadsReducersNamesMap = {
  setNotifications: 'setNotifications',
  setError: 'setError',
  toggleProgress: 'toggleProgress',
};
const {
  reducer,
  actions,
}: {
  reducer: any;
  actions: NotificationsActions;
} = createSlice({
  name: inboxThreadsNamespace,
  initialState,
  reducers: {
    [inboxThreadsReducersNamesMap.setNotifications]: (
      state: InboxThreadState,
      action: {
        payload: {
          threads: InboxThread[];
          reset?: boolean;
          folderId: string;
        };
      },
    ) => {
      const {threads, reset, folderId} = action.payload;

      if (!state.threadsData[folderId]) {
        state.threadsData[folderId] = {
          threads: [],
          hasMore: false,
        };
      }

      state.threadsData[folderId] = {
        threads:
          reset === true
            ? threads
            : state.threadsData[folderId].threads
                .slice(0, state.threadsData[folderId].threads.length - 1)
                .concat(threads),
        hasMore: threads.length === threadsPageSize,
      };
    },
    [inboxThreadsReducersNamesMap.setError]: (
      state: InboxThreadState,
      action: {
        payload: {
          error: CustomError | null;
        };
      },
    ) => {
      state.error = action.payload.error;
    },
    [inboxThreadsReducersNamesMap.toggleProgress]: (
      state: InboxThreadState,
      action: {
        payload: {
          inProgress: boolean;
        };
      },
    ) => {
      state.inProgress = action.payload.inProgress;
    },
  },
});
export const {setNotifications, toggleProgress, setError} = actions;
export default reducer;