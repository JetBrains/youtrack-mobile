import {folderIdAllKey} from './inbox-threads-helper';

import type {InboxThread, ThreadsStateFilterId} from 'types/Inbox';
import type {ThreadsStateData} from 'views/inbox-threads/inbox-threads-reducers';

export const useThreadsList = ({
  threadsData,
  folderId,
}: {
  threadsData: ThreadsStateData;
  folderId: ThreadsStateFilterId | null;
}) => {
  const data = threadsData[folderId || folderIdAllKey] || {
    threads: [],
    hasMore: false,
  };

  const visibleThreads: InboxThread[] = (
    data.hasMore ? data.threads.slice(0, data.threads.length - 1) : data.threads
  ).filter((it: InboxThread) => it.subject.target && it.messages.length > 0);

  const hasVisibleMessages: boolean =
    visibleThreads.length > 0 &&
    visibleThreads.reduce((amount: number, it: InboxThread) => amount + it.messages.length, 0) > 0;

  return {
    data,
    visibleThreads,
    hasVisibleMessages,
  };
};
