/* @flow */

import React from 'react';

import {useSelector} from 'react-redux';

import InboxThreadsList from './inbox-threads__list';

import type {AnyIssue} from 'flow/Issue';
import type {AppState} from '../../reducers';
import type {Article} from 'flow/Article';
import type {InboxThread} from 'flow/Inbox';

interface Props {
  folderId?: string,
  onNavigate: (entity: AnyIssue | Article, navigateToActivity: string) => any,
  onLoadMore: (end?: number | null) => any;
}


const InboxThreadsTab = ({folderId, onNavigate, onLoadMore}: Props) => {
  const threadsData: { threads: InboxThread[], hasMore: boolean } = useSelector(
    (state: AppState) => state.inboxThreads.threadsData
  );

  return (
    <InboxThreadsList
      folderId={folderId}
      onLoadMore={(end?: number) => onLoadMore(folderId, end)}
      onNavigate={onNavigate}
      threadsData={threadsData}
    />
  );
};


export default React.memo<Props>(InboxThreadsTab);
