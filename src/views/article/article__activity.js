/* @flow */

import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import {useActionSheet} from '@expo/react-native-action-sheet';

import * as articleActions from './arcticle-actions';
import ArticleActivityStream from './article__activity-stream';
import ArticleAddComment from './article__add-comment';
import CommentEdit from '../../components/comment/comment-edit';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import Router from '../../components/router/router';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLE_PAGE_STREAM,} from '../../components/analytics/analytics-ids';
import {attachmentActions} from '../issue/activity/issue-activity__attachment-actions-and-types';
import {convertCommentsToActivityPage, createActivityModel} from '../../components/activity/activity-helper';

import styles from './article.styles';

import type {ActivityItem, ActivityStreamCommentActions} from '../../flow/Activity';
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
  const activityPage: Array<ActivityItem> = useSelector(store => store.article.activityPage);
  const articleCommentDraft: ?IssueComment = useSelector(store => store.article.articleCommentDraft);
  const user: User = useSelector(store => store.app.user);

  const refreshActivities: Function = (reset?: boolean) => dispatch(articleActions.loadActivitiesPage(reset));
  const loadActivities: Function = (reset: boolean) => {
    if (article?.idReadable) {
      dispatch(articleActions.loadCachedActivitiesPage());
      refreshActivities(reset);
    }
  };

  const getSortOrder = (): boolean => !!user?.profiles?.appearance?.naturalCommentsOrder;
  const doCreateActivityModel = (activitiesPage: Array<ActivityItem>): void => {
    updateActivityModel(createActivityModel(activitiesPage, getSortOrder()));
  };

  useEffect(() => {
    loadActivities(false);
  }, []);

  useEffect(() => {
    if (activityPage) {
      doCreateActivityModel(activityPage);
    }
  }, [activityPage]);


  const createCommentActions = (): ActivityStreamCommentActions => {
    const canDeleteComment = (comment: IssueComment): boolean => (
      issuePermissions.articleCanDeleteComment(article, comment)
    );
    return ({
      isAuthor: (comment: IssueComment): boolean => issuePermissions.isCurrentUser(comment.author),
      canUpdateComment: (comment: IssueComment): boolean => issuePermissions.articleCanUpdateComment(article, comment),
      onStartEditing: (comment: Comment): void => {
        Router.PageModal({
          children: (
            <CommentEdit
              comment={comment}
              onUpdate={(comment: IssueComment): Function => dispatch(articleActions.updateArticleComment(comment))}
              canDeleteCommentAttachment={(attachment: Attachment): boolean => (
                issuePermissions.canDeleteCommentAttachment(attachment, article)
              )}
              onDeleteAttachment={(attachment: Attachment): Function => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Article edit comment: remove attachment');
                dispatch(attachmentActions.removeArticleAttachment(attachment));
              }}
            />
          )
        });
      },
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
    const commentActivity: ActivityItem = [{
      ...convertCommentsToActivityPage([comment])[0],
      tmp: true,
      timestamp: Date.now(),
      author: currentUser,
    }];

    doCreateActivityModel(
      getSortOrder()
        ? activityPage.concat(commentActivity)
        : commentActivity.concat(activityPage)
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
          issuePermissions={issuePermissions}
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

export default React.memo<Props>(ArticleActivities);
