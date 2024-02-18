import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import * as articleActions from './arcticle-actions';
import ArticleActivityStream from './article__activity-stream';
import ArticleAddComment from './article__add-comment';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import KeyboardSpacerIOS from 'components/platform/keyboard-spacer.ios';
import TipActivityActionAccessTouch from 'components/tip/tips/activity-touch-actions';
import {convertCommentsToActivityPage, createActivityModel} from 'components/activity/activity-helper';
import {setDraftCommentData} from 'actions/app-actions';

import type {Activity} from 'types/Activity';
import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {IssueComment} from 'types/CustomFields';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import {ReduxThunkDispatch} from 'types/Redux';

interface Props {
  article: Article;
  issuePermissions: IssuePermissions;
  renderRefreshControl: (onRefresh: () => void) => React.ReactNode;
  uiTheme: UITheme;
  onCheckboxUpdate?: (articleContent: string) => (...args: any[]) => any;
  highlight?: {
    activityId?: string;
    commentId?: string;
  };
}


const ArticleActivities = (props: Props) => {
  const {article, uiTheme, renderRefreshControl, issuePermissions} = props;
  const dispatch: ReduxThunkDispatch = useDispatch();

  const activityPage = useSelector((state: AppState) => state.article.activityPage);
  const articleCommentDraft = useSelector(
    (state: AppState) => state.article.articleCommentDraft,
  );
  const currentUser = useSelector((state: AppState) => state.app.user);
  const user = useSelector((state: AppState) => state.app.user);

  const [activities, updateActivityModel] = useState<Activity[] | null>(null);

  const refreshActivities = useCallback(
    (reset?: boolean) => dispatch(articleActions.loadActivitiesPage(reset)),
    [dispatch]
  );

  const loadActivities = useCallback(
    (reset: boolean) => {
      if (article?.idReadable) {
        dispatch(articleActions.loadCachedActivitiesPage());
        refreshActivities(reset);
      }
    },
    [article?.idReadable, dispatch, refreshActivities]
  );

  const isNaturalSortOrder = !!user?.profiles?.appearance?.naturalCommentsOrder;
  const doCreateActivityModel = useCallback(
    (activitiesPage: Activity[]): void => {
      updateActivityModel(
        createActivityModel(activitiesPage, isNaturalSortOrder),
      );
    },
    [isNaturalSortOrder],
  );

  useEffect(() => {
    dispatch(setDraftCommentData(
      articleActions.updateArticleCommentDraft,
      () => async () => await articleCommentDraft,
      article,
    ));
  }, [article, articleCommentDraft, dispatch]);

  useEffect(() => {
    loadActivities(false);
  }, [loadActivities]);

  useEffect(() => {
    if (activityPage) {
      doCreateActivityModel(activityPage);
    }
  }, [activityPage, doCreateActivityModel, user?.profiles?.appearance]);

  const updateActivities = (comment: IssueComment) => {
    const commentActivity: (Activity & { tmp?: boolean })[] = [{
      ...convertCommentsToActivityPage([comment])[0],
      tmp: true,
      timestamp: Date.now(),
      author: currentUser as User,
    }];
    doCreateActivityModel(
      isNaturalSortOrder
        ? activityPage!.concat(commentActivity)
        : commentActivity.concat(activityPage!),
    );
  };

  const canCommentOn: boolean = issuePermissions.articleCanCommentOn(article);
  return (
    <>
      <ArticleActivityStream
        article={article}
        activities={activities}
        attachments={article?.attachments}
        uiTheme={uiTheme}
        user={user}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          comment: IssueComment,
        ) => dispatch(articleActions.updateArticleComment(comment))}
        refreshControl={() => renderRefreshControl(() => loadActivities(false))}
        highlight={props.highlight}
        onUpdate={refreshActivities}
      />

      {canCommentOn && (
        <>
          <ArticleAddComment
            article={article}
            comment={articleCommentDraft}
            onCommentChange={(comment: IssueComment) => dispatch(articleActions.updateArticleCommentDraft(comment))}
            onSubmitComment={async (comment: IssueComment) => {
              updateActivities(comment);
              await dispatch(articleActions.submitArticleCommentDraft(comment));
              refreshActivities(false);
              return Promise.resolve();
            }}
            issuePermissions={issuePermissions}
          />
          <KeyboardSpacerIOS top={98}/>
        </>
      )}
      <TipActivityActionAccessTouch canAddComment={canCommentOn}/>
    </>
  );
};

export default React.memo<Props>(ArticleActivities);
