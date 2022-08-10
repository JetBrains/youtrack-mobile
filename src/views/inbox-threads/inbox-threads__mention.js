/* @flow */

import React, {useState} from 'react';

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

import type {Activity} from 'flow/Activity';
import type {InboxThread, ThreadEntity} from 'flow/Inbox';
import type {IssueComment} from 'flow/CustomFields';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';

interface Props {
  currentUser: User;
  onNavigate: (entity: ThreadEntity, navigateToActivity?: string) => any;
  thread: InboxThread;
  uiTheme: UITheme;
}

export default function InboxThreadMention({thread, currentUser, uiTheme, onNavigate}: Props) {
  const [isReactionPanelVisible, updateReactionPanelVisible] = useState(false);

  const activity: Activity = thread.messages[0].activities[0];
  activity.author = ApiHelper.convertRelativeUrl(activity.author, 'avatarUrl', getApi().config.backendUrl);
  let comment: ?IssueComment;
  let text: ?string;

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
        avatar={<Avatar
          userName={getEntityPresentation(activity.author)}
          size={30}
          source={{uri: activity.author.avatarUrl}}
        />}
        change={
          <>
            <StreamComment activity={{added: [comment]}}/>
            {!!comment && (
              <ThreadCommentReactions
                activity={activity}
                currentUser={currentUser}
                isPanelVisible={isReactionPanelVisible}
              />
            )}
          </>
        }
        onNavigate={() => {
          onNavigate(target.issue || target.article, activity.id, comment?.id);
        }}
        reason={i18n('mentioned you')}
        timestamp={thread.notified}
      />
      <ThreadAddReactionButton
        style={styles.threadReactionsAddButton}
        onPress={() => updateReactionPanelVisible(true)}/>
    </>
  ) : null;
}
