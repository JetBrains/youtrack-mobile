import React from 'react';

import InboxThreadItemSubscription from './inbox-threads__subscription';
import InboxThreadMention from './inbox-threads__mention';
import InboxThreadReaction from './inbox-threads__reactions';
import {getStorageState} from 'components/storage/storage';
import {getThreadTypeData} from 'views/inbox-threads/inbox-threads-helper';

import type {Entity} from 'types/Entity';
import type {InboxThread, InboxThreadTarget} from 'types/Inbox';

export interface ThreadData {
  entity: Entity | InboxThreadTarget;
  isBottomPositioned: boolean;
  ThreadView: React.ElementType;
}

export function useThread(thread: InboxThread): ThreadData {
  const target = thread.subject.target;
  const entity = target?.issue || target?.article || target;
  const threadTypeData = getThreadTypeData(thread);
  let ThreadView;
  if (threadTypeData.isReaction) {
    ThreadView = InboxThreadReaction;
  } else if (threadTypeData.isMention) {
    ThreadView = InboxThreadMention;
  } else {
    ThreadView = InboxThreadItemSubscription;
  }

  const isBottomPositioned = getStorageState().mergedNotifications
    ? false
    : threadTypeData.isReaction || threadTypeData.isMention;

  return {entity, ThreadView, isBottomPositioned};
}
