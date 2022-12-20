import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ReactionsPanel from '../issue/activity/issue__activity-reactions-dialog';
import usage from 'components/usage/usage';
import {ActivityStream} from 'components/activity-stream/activity__stream';
import {ANALYTICS_ARTICLE_PAGE_STREAM} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {onReactionSelect} from './arcticle-actions';
import {SkeletonIssueActivities} from 'components/skeleton/skeleton';
import {updateMarkdownCheckbox} from 'components/wiki/markdown-helper';
import type {
  Activity,
  ActivityItem,
  ActivityStreamCommentActions,
} from 'types/Activity';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {AppState} from '../../reducers';
import type {Reaction} from 'types/Reaction';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {WorkTimeSettings} from 'types/Work';
import type {YouTrackWiki} from 'types/Wiki';
type Props = {
  articleId: string;
  activities: ActivityItem[] | null;
  attachments: Attachment[];
  uiTheme: UITheme;
  user: User;
  commentActions: ActivityStreamCommentActions;
  onCheckboxUpdate?: (
    checked: boolean,
    position: number,
    comment: IssueComment,
  ) => void;
  renderHeader?: () => any;
  refreshControl: () => any;
  highlight?: {
    activityId: string;
    commentId?: string;
  };
};

const getYoutrackWikiProps = (): YouTrackWiki => {
  let imageHeaders = null;
  let backendUrl = '';

  try {
    imageHeaders = getApi().auth.getAuthorizationHeaders();
  } catch (e) {}

  try {
    backendUrl = getApi().config.backendUrl;
  } catch (e) {}

  return {
    backendUrl,
    imageHeaders,
  };
};

const ArticleActivityStream = (props: Props) => {
  const dispatch = useDispatch();
  const {
    activities,
    attachments,
    uiTheme,
    user,
    commentActions,
    onCheckboxUpdate,
  } = props;
  const [_activities, setActivities] = useState(activities);
  useEffect(() => {
    setActivities(props.activities);
  }, [props.activities]);
  const [reactionState, setReactionState] = useState({
    isReactionsPanelVisible: false,
    currentComment: null,
  });

  const hideReactionsPanel = (): void =>
    setReactionState({
      isReactionsPanelVisible: false,
      currentComment: null,
    });

  const selectReaction = (comment: IssueComment, reaction: Reaction) => {
    usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Add reaction to comment');
    hideReactionsPanel();
    dispatch(
      onReactionSelect(
        props.articleId,
        comment,
        reaction,
        _activities,
        (updatedActivities: Activity[]) =>
          setActivities(updatedActivities),
      ),
    );
  };

  const workTimeSettings: WorkTimeSettings = useSelector(
    (store: AppState) => store.app.workTimeSettings,
  );
  const isLoading: boolean = useSelector(
    (store: AppState) => store.article.isLoading,
  );

  if (!activities && isLoading) {
    return <SkeletonIssueActivities />;
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
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          comment: IssueComment,
        ) => {
          if (onCheckboxUpdate) {
            const updatedCommentText: string = updateMarkdownCheckbox(
              comment.text,
              position,
              checked,
            );
            onCheckboxUpdate(checked, position, {
              ...comment,
              text: updatedCommentText,
            });
          }
        }}
        refreshControl={props.refreshControl}
        renderHeader={props.renderHeader}
        highlight={props.highlight}
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

export default React.memo<Props>(
  ArticleActivityStream,
) as React$AbstractComponent<Props, unknown>;
