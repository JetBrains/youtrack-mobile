import React, {useState} from 'react';

import {TouchableOpacity} from 'react-native-gesture-handler';

import ApiHelper from 'components/api/api__helper';
import Avatar from 'components/avatar/avatar';
import StreamComment from 'components/activity-stream/activity__stream-comment';
import ThreadAddReactionButton from './inbox-threads__item-comment-add-reaction-button';
import ThreadCommentReactions from './inbox-threads__item-comment-reactions';
import ThreadItem from './inbox-threads__item';
import {getApi} from 'components/api/api__instance';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {isActivityCategory} from 'components/activity/activity__category';

import styles from './inbox-threads.styles';

import type {Activity} from 'types/Activity';
import type {InboxThread} from 'types/Inbox';
import type {IssueComment} from 'types/CustomFields';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import {Entity} from 'types/Entity';

type Props = {
  currentUser: User;
  onNavigate: (entity: Entity, navigateToActivity?: string) => any;
  thread: InboxThread;
  uiTheme: UITheme;
};


export default function InboxThreadMention({
  thread,
  currentUser,
  uiTheme,
  onNavigate,
}: Props): JSX.Element | null {
  const [isReactionPanelVisible, updateReactionPanelVisible] = useState(false);
  const activity: Activity = thread.messages[0].activities[0];
  activity.author = ApiHelper.convertRelativeUrl(
    activity.author,
    'avatarUrl',
    getApi().config.backendUrl,
  );
  let comment: IssueComment | null | undefined;
  let text: string | null | undefined;

  if (isActivityCategory.commentMention(activity)) {
    comment = activity.comment;
    text = comment?.text;
  } else if (isActivityCategory.issueMention(activity)) {
    text = activity?.issue?.description;
  } else if (isActivityCategory.articleCommentMention(activity)) {
    comment = activity?.comment;
    text = comment?.text;
  } else if (isActivityCategory.articleMention(activity)) {
    text = activity?.article?.content;
  }

  const target = thread.subject.target;
  return text ? (
    <>
      <ThreadItem
        author={activity.author}
        avatar={
          <Avatar
            userName={getEntityPresentation(activity.author)}
            size={30}
            source={{
              uri: activity.author.avatarUrl,
            }}
          />
        }
        change={
          <>
            <TouchableOpacity
              onPress={() => {
                onNavigate(
                  target.issue || target.article,
                  activity.id,
                  comment?.id,
                );
              }}
            >
              <StreamComment
                activity={{
                  added: [comment],
                }}
              />
            </TouchableOpacity>
            {!!comment && (
              <ThreadCommentReactions
                activity={activity}
                currentUser={currentUser}
                isPanelVisible={isReactionPanelVisible}
              />
            )}
          </>
        }
        reason={i18n('mentioned you')}
        timestamp={thread.notified}
      />
      <ThreadAddReactionButton
        style={styles.threadReactionsAddButton}
        onPress={() => updateReactionPanelVisible(true)}
      />
    </>
  ) : null;
}
