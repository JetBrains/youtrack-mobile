/* @flow */

import React, {useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import API from 'components/api/api';
import ReactionsPanel from '../issue/activity/issue__activity-reactions-dialog';
import usage from 'components/usage/usage';
import {ActivityStream} from 'components/activity-stream/activity__stream';
import {ANALYTICS_ARTICLE_PAGE_STREAM} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {onReactionSelect} from './arcticle-actions';
import {SkeletonIssueActivities} from 'components/skeleton/skeleton';
import {updateMarkdownCheckbox} from 'components/wiki/markdown-helper';

import type {Activity, ActivityItem, ActivityStreamCommentActions} from 'flow/Activity';
import type {Attachment, IssueComment} from 'flow/CustomFields';
import type {AppState} from '../../reducers';
import type {Reaction} from 'flow/Reaction';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';
import type {WorkTimeSettings} from 'flow/Work';
import type {YouTrackWiki} from 'flow/Wiki';

type Props = {
  articleId: string,
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
  const dispatch = useDispatch();
  const {activities, attachments, uiTheme, user, commentActions, onCheckboxUpdate} = props;

  const [_activities, setActivities] = useState(activities);

  useEffect(() => {
    setActivities(props.activities);
  }, [props.activities]);

  const [reactionState, setReactionState] = useState({
    isReactionsPanelVisible: false,
    currentComment: null,
  });
  const hideReactionsPanel = (): void => setReactionState({isReactionsPanelVisible: false, currentComment: null});
  const selectReaction = (comment: IssueComment, reaction: Reaction) => {
    usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Add reaction to comment');
    hideReactionsPanel();
    dispatch(onReactionSelect(
      props.articleId,
      comment,
      reaction,
      _activities,
      (updatedActivities: Array<Activity>) => setActivities(updatedActivities)
    ));
  };


  const workTimeSettings: WorkTimeSettings = useSelector((store: AppState) => store.app.workTimeSettings);
  const isLoading: boolean = useSelector((store: AppState) => store.article.isLoading);

  if (!activities && isLoading) {
    return <SkeletonIssueActivities/>;
  }
  return (
    <>
      <ActivityStream
        activities={_activities}
        attachments={attachments}
        uiTheme={uiTheme}
        workTimeSettings={workTimeSettings}
        youtrackWiki={getYoutrackWikiProps()}

        onSelectReaction={selectReaction}
        onReactionPanelOpen={(comment: IssueComment) => {
          setReactionState({
            isReactionsPanelVisible: true,
            currentComment: comment,
          });
        }}

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
      {reactionState.isReactionsPanelVisible && (
        <ReactionsPanel
          onSelect={(reaction: Reaction) => {
            selectReaction(reactionState.currentComment, reaction);
          }}
          onHide={hideReactionsPanel}
        />
      )}
    </>
  );
};

export default (React.memo<Props>(ArticleActivityStream): React$AbstractComponent<Props, mixed>);
