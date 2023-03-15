import * as React from 'react';
import {View} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';

import ReactionIcon from 'components/reactions/reaction-icon';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import ThreadCommentReactions from './inbox-threads__item-comment-reactions';
import ThreadItem from './inbox-threads__item';
import {i18n} from 'components/i18n/i18n';

import stylesInbox from '../inbox/inbox.styles';

import type {Activity} from 'types/Activity';
import type {InboxThread, ThreadEntity} from 'types/Inbox';
import type {IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';
import type {User} from 'types/User';
import {InboxThreadGroup} from 'types/Inbox';

type Props = {
  currentUser: User;
  onNavigate: (entity: ThreadEntity, navigateToActivity?: boolean) => any;
  thread: InboxThread;
  group?: InboxThreadGroup;
};


const getReason = (activity: Activity & {comment: IssueComment}): string => {
  const comment: IssueComment = activity?.comment;
  const isRemoved: boolean = !!activity?.removed?.[0];
  const isAdded: boolean = !!activity?.added?.[0];
  return isAdded
    ? comment?.reactions?.length > 0
      ? i18n('added a reaction')
      : ''
    : isRemoved
      ? i18n('removed a reaction')
      : '';
};

const ThreadReaction = ({activity, currentUser, timestamp, onNavigate, children}) => {
  const reaction: Reaction = activity?.added?.[0] || activity?.removed?.[0];
  const comment: IssueComment = activity?.comment;
  const isRemoved: boolean = !!activity?.removed[0];
  return (
    <ThreadItem
      author={activity.author}
      avatar={<>
        <ReactionIcon name={reaction.reaction} size={24}/>
        {isRemoved && <View style={stylesInbox.reactionIconRemoved}/>}
      </>}
      change={
        !!comment && (
          <>
            <TouchableOpacity
              onPress={() => {
                const entity: ThreadEntity = comment?.issue || comment?.article;
                if (entity?.id) {
                  onNavigate(entity, activity.id, comment?.id);
                }
              }}
            >
              <StreamComment activity={{...activity, added: [comment]}}/>
            </TouchableOpacity>
            {children}
          </>
        )
      }
      reason={getReason(activity)}
      timestamp={timestamp}
    />
  );
};


const InboxThreadReaction = ({thread, group, currentUser, onNavigate}: Props) => {
  const messagesHolder = thread || group;
  return <>
    {messagesHolder.messages.map((message) => {
      const activity = message.activities[0];
      return (
        <ThreadReaction
          key={activity.id}
          activity={activity}
          currentUser={currentUser}
          timestamp={thread?.notified || group?.head?.timestamp}
          onNavigate={onNavigate}
        >
          <ThreadCommentReactions
            activity={activity}
            currentUser={currentUser}
            isPanelVisible={false}
          />
        </ThreadReaction>
      );
    })}
  </>;
};


export default React.memo(InboxThreadReaction, (prev: Props, next: Props) => {
  return prev?.thread === next?.thread;
});
