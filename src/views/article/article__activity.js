/* @flow */

import React, {useEffect, useState, useCallback} from 'react';
import {ScrollView} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import {useActionSheet} from '@expo/react-native-action-sheet';

import * as articleActions from './arcticle-actions';
import ApiHelper from '../../components/api/api__helper';
import ArticleActivityStream from './article__activity-stream';
import ArticleActivityStreamCommentEdit from './article__edit-comment';
import ArticleAddComment from './article__add-comment';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import Router from '../../components/router/router';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLE_PAGE_STREAM} from '../../components/analytics/analytics-ids';
import {convertCommentsToActivityPage, createActivityModel} from '../../components/activity/activity-helper';

import styles from './article.styles';

import type {Activity, ActivityStreamCommentActions} from '../../flow/Activity';
import type {Article} from '../../flow/Article';
import type {Attachment, IssueComment} from '../../flow/CustomFields';
import type {UITheme} from '../../flow/Theme';
import type {User} from '../../flow/User';

type Props = {
  article: Article,
  issuePermissions: IssuePermissions,
  renderRefreshControl: (onRefresh: Function, showActivityIndicator: boolean) => React$Element<any>,
  uiTheme: UITheme,
  onCheckboxUpdate?: (articleContent: string) => Function,
};


const ArticleActivities = (props: Props) => {
  const {article, uiTheme, renderRefreshControl, issuePermissions} = props;

  const dispatch: Function = useDispatch();
  const {showActionSheetWithOptions} = useActionSheet();
  const [activities, updateActivityModel] = useState(null);

  const currentUser: User = useSelector(store => store.app.user);
  const activityPage: Array<Activity> = useSelector(store => store.article.activityPage);
  const articleCommentDraft: IssueComment | null = useSelector(store => store.article.articleCommentDraft);
  const user: User = useSelector(store => store.app.user);
  const isNaturalSortOrder: boolean = !!user?.profiles?.appearance?.naturalCommentsOrder;

  const refreshActivities: Function = useCallback(
    (reset?: boolean) => dispatch(articleActions.loadActivitiesPage(reset)),
    [dispatch]
  );
  const loadActivities: Function = useCallback((reset: boolean) => {
    if (article?.idReadable) {
      dispatch(articleActions.loadCachedActivitiesPage());
      refreshActivities(reset);
    }
  }, [article?.idReadable, dispatch, refreshActivities]);

  const doCreateActivityModel = useCallback((activitiesPage: Array<Activity>): void => {
    updateActivityModel(createActivityModel(activitiesPage, isNaturalSortOrder));
  }, [isNaturalSortOrder]);

  useEffect(() => {
    loadActivities(false);
  }, [loadActivities]);

  useEffect(() => {
    if (activityPage) {
      doCreateActivityModel(activityPage);
    }
  }, [activityPage, doCreateActivityModel, user?.profiles?.appearance]);


  const createCommentActions = (): ActivityStreamCommentActions => {
    const canDeleteComment = (comment: IssueComment): boolean => (
      issuePermissions.articleCanDeleteComment(article, comment)
    );
    const onEditComment = (comment: IssueComment, backendUrl?: string): void => {
      let attachments: Array<Attachment> = comment.attachments || [];
      if (comment.attachments && backendUrl) {
        attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(comment.attachments, backendUrl);
      }
      usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Edit comment');
      const onCommentChange: (comment: IssueComment) => Function = (comment: IssueComment) => dispatch(
        articleActions.updateArticleComment(comment)
      );
      Router.PageModal({
        children: (
          <ArticleActivityStreamCommentEdit
            article={article}
            issuePermissions={issuePermissions}
            comment={{
              ...comment,
              attachments,
            }}
            onCommentChange={onCommentChange}
            onSubmitComment={onCommentChange}
          />
        ),
      });
    };

    return ({
      isAuthor: (comment: IssueComment): boolean => issuePermissions.isCurrentUser(comment.author),
      canUpdateComment: (comment: IssueComment): boolean => issuePermissions.articleCanUpdateComment(article, comment),
      onStartEditing: onEditComment,
      onShowCommentActions: async (comment: IssueComment, activityId: string) => dispatch(
        articleActions.showArticleCommentActions(
          showActionSheetWithOptions,
          comment,
          activityId,
          canDeleteComment(comment)
        )
      ),
      canDeleteComment: canDeleteComment,
    });
  };

  const updateActivities = (comment: IssueComment): void => {
    const commentActivity: Array<Object> = [{
      ...convertCommentsToActivityPage([comment])[0],
      tmp: true,
      timestamp: Date.now(),
      author: currentUser,
    }];

    doCreateActivityModel(
      isNaturalSortOrder ? activityPage.concat(commentActivity) : commentActivity.concat(activityPage)
    );
  };

  return (
    <>
      <ScrollView
        refreshControl={renderRefreshControl(() => loadActivities(false), !activities)}
        contentContainerStyle={styles.articleActivities}
      >
        <ArticleActivityStream
          activities={activities}
          attachments={article?.attachments}
          uiTheme={uiTheme}
          user={user}
          commentActions={createCommentActions()}
          onCheckboxUpdate={(checked: boolean, position: number, comment: IssueComment) => (
            dispatch(articleActions.updateArticleComment(comment))
          )}
        />
      </ScrollView>
      {issuePermissions.articleCanCommentOn(article) && (
        <ArticleAddComment
          article={article}
          comment={articleCommentDraft}
          onCommentChange={(comment: IssueComment): Function => dispatch(
            articleActions.updateArticleCommentDraft(comment)
          )}
          onSubmitComment={async (comment: IssueComment): Function => {
            updateActivities(comment);
            await dispatch(articleActions.submitArticleCommentDraft(comment));
            refreshActivities(false);
            return Promise.resolve();
          }}
          issuePermissions={issuePermissions}
        />
      )}
    </>
  );
};

export default (React.memo<Props>(ArticleActivities): React$AbstractComponent<Props, mixed>);
