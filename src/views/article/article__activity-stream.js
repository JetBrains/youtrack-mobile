/* @flow */

import React from 'react';

import {useSelector} from 'react-redux';

import API from 'components/api/api';
import {ActivityStream} from 'components/activity-stream/activity__stream';
import {getApi} from 'components/api/api__instance';
import {updateMarkdownCheckbox} from 'components/wiki/markdown-helper';

import type {ActivityItem, ActivityStreamCommentActions} from 'flow/Activity';
import type {Attachment, IssueComment} from 'flow/CustomFields';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';
import type {WorkTimeSettings} from 'flow/Work';
import type {YouTrackWiki} from 'flow/Wiki';

type Props = {
  activities: Array<ActivityItem> | null,
  attachments: Array<Attachment>,
  uiTheme: UITheme,
  user: User,
  commentActions: ActivityStreamCommentActions,
  onCheckboxUpdate?: (checked: boolean, position: number, comment: IssueComment) => void,
};


const getYoutrackWikiProps = (): YouTrackWiki => {
  const api: API = getApi();
  return {
    backendUrl: api.config.backendUrl,
    imageHeaders: api.auth.getAuthorizationHeaders(),
  };
};

const ArticleActivityStream = (props: Props) => {
  const {activities, attachments, uiTheme, user, commentActions, onCheckboxUpdate} = props;

  const workTimeSettings: WorkTimeSettings = useSelector(store => store.app.workTimeSettings);

  return (
    <ActivityStream
      activities={activities}
      attachments={attachments}
      uiTheme={uiTheme}
      workTimeSettings={workTimeSettings}
      youtrackWiki={getYoutrackWikiProps()}
      onReactionSelect={() => {}}
      currentUser={user}
      commentActions={commentActions}
      onCheckboxUpdate={(checked: boolean, position: number, comment: IssueComment) => {
        if (onCheckboxUpdate) {
          const updatedCommentText: string = updateMarkdownCheckbox(comment.text, position, checked);
          onCheckboxUpdate(checked, position, {
            ...comment,
            text: updatedCommentText,
          });
        }
      }}
    />
  );
};

export default (React.memo<Props>(ArticleActivityStream): React$AbstractComponent<Props, mixed>);
