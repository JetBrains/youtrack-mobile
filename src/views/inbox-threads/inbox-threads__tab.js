/* @flow */

import React from 'react';

import {useSelector} from 'react-redux';

import InboxThreadsList from './inbox-threads__list';

import type {AnyIssue} from 'flow/Issue';
import type {AppState} from '../../reducers';
import type {Article} from 'flow/Article';
import type {InboxThread, ThreadEntity} from 'flow/Inbox';

interface Props {
  folderId?: string,
  onSelect: (entity: AnyIssue | Article, navigateToActivity: boolean) => any,
  onLoadMore: (end?: number | null) => any;
}


const InboxThreadsTab = ({folderId, onSelect, onLoadMore}: Props) => {
  const threadsData: { threads: InboxThread[], hasMore: boolean } = useSelector(
    (state: AppState) => state.inboxThreads.threadsData
  );

  return (
    <InboxThreadsList
      folderId={folderId}
      onLoadMore={(end?: number | null) => onLoadMore(folderId, end)}
      onPress={(entity: ThreadEntity, navigateToActivity?: boolean) => onSelect(entity, navigateToActivity)}
      threadsData={threadsData}
    />
  );
};


export default React.memo<Props>(InboxThreadsTab);
