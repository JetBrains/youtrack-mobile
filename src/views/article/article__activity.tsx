import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useActionSheet} from '@expo/react-native-action-sheet';
import * as articleActions from './arcticle-actions';
import ApiHelper from 'components/api/api__helper';
import ArticleActivityStream from './article__activity-stream';
import ArticleActivityStreamCommentEdit from './article__edit-comment';
import ArticleAddComment from './article__add-comment';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import Router from 'components/router/router';
import KeyboardSpacerIOS from 'components/platform/keyboard-spacer.ios';
import usage from 'components/usage/usage';
import {ANALYTICS_ARTICLE_PAGE_STREAM} from 'components/analytics/analytics-ids';
import {
  convertCommentsToActivityPage,
  createActivityModel,
} from 'components/activity/activity-helper';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {setArticleCommentDraft} from './article-reducers';
import type {Activity, ActivityStreamCommentActions} from 'flow/Activity';
import type {AppState} from '../../reducers';
import type {Article} from 'flow/Article';
import type {Attachment, IssueComment} from 'flow/CustomFields';
import type {UITheme} from 'flow/Theme';
import type {User} from 'flow/User';
type Props = {
  article: Article;
  issuePermissions: IssuePermissions;
  renderRefreshControl: (
    onRefresh: (...args: Array<any>) => any,
  ) => React.ReactElement<React.ComponentProps<any>, any>;
  uiTheme: UITheme;
  onCheckboxUpdate?: (articleContent: string) => (...args: Array<any>) => any;
  highlight?: {
    activityId: string;
    commentId?: string;
  };
};

const ArticleActivities = (props: Props) => {
  const {article, uiTheme, renderRefreshControl, issuePermissions} = props;
  const dispatch: (...args: Array<any>) => any = useDispatch();
  const {showActionSheetWithOptions} = useActionSheet();
  const [activities, updateActivityModel] = useState(null);
  const currentUser: User = useSelector(store => store.app.user);
  const activityPage: Array<Activity> = useSelector(
    store => store.article.activityPage,
  );
  const articleCommentDraft: IssueComment | null = useSelector(
    store => store.article.articleCommentDraft,
  );
  const user: User = useSelector(store => store.app.user);
  const isNaturalSortOrder: boolean = !!user?.profiles?.appearance
    ?.naturalCommentsOrder;
  const configBackendUrl: string = useSelector(
    (appState: AppState) => appState.app.auth?.config?.backendUrl || '',
  );
  const refreshActivities: (...args: Array<any>) => any = useCallback(
    (reset?: boolean) => dispatch(articleActions.loadActivitiesPage(reset)),
    [dispatch],
  );
  const loadActivities: (...args: Array<any>) => any = useCallback(
    (reset: boolean) => {
      if (article?.idReadable) {
        dispatch(articleActions.loadCachedActivitiesPage());
        refreshActivities(reset);
      }
    },
    [article?.idReadable, dispatch, refreshActivities],
  );
  const doCreateActivityModel = useCallback(
    (activitiesPage: Array<Activity>): void => {
      updateActivityModel(
        createActivityModel(activitiesPage, isNaturalSortOrder),
      );
    },
    [isNaturalSortOrder],
  );
  useEffect(() => {
    loadActivities(false);
  }, [loadActivities]);
  useEffect(() => {
    if (activityPage) {
      doCreateActivityModel(activityPage);
    }
  }, [activityPage, doCreateActivityModel, user?.profiles?.appearance]);

  const createCommentActions = (): ActivityStreamCommentActions => {
    const canDeleteComment = (comment: IssueComment): boolean =>
      issuePermissions.articleCanDeleteComment(article, comment);

    const onEditComment = (comment: IssueComment): void => {
      let attachments: Array<Attachment> = comment.attachments || [];

      if (comment.attachments && configBackendUrl) {
        attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
          comment.attachments,
          configBackendUrl,
        );
      }

      usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Edit comment');

      const onCommentChange: (
        comment: IssueComment,
      ) => (...args: Array<any>) => any = (comment: IssueComment) =>
        dispatch(articleActions.updateArticleComment(comment));

      Router.PageModal({
        children: (
          <ArticleActivityStreamCommentEdit
            article={article}
            issuePermissions={issuePermissions}
            comment={{...comment, attachments}}
            onCommentChange={onCommentChange}
            onSubmitComment={onCommentChange}
          />
        ),
      });
    };

    return {
      isAuthor: (comment: IssueComment): boolean =>
        issuePermissions.isCurrentUser(comment.author),
      canUpdateComment: (comment: IssueComment): boolean =>
        issuePermissions.articleCanUpdateComment(article, comment),
      onStartEditing: onEditComment,
      onShowCommentActions: async (comment: IssueComment, activityId: string) =>
        dispatch(
          articleActions.showArticleCommentActions(
            showActionSheetWithOptions,
            comment,
            activityId,
            canDeleteComment(comment),
          ),
        ),
      canDeleteComment: canDeleteComment,
      canCommentOn: issuePermissions.articleCanCommentOn(article),
      onReply: (comment: IssueComment) => {
        usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Reply on comment');
        dispatch(
          setArticleCommentDraft({
            reply: true,
            text: `> ${comment.text ? `${comment.text}\n\n` : ''}@${
              comment?.author?.login || getEntityPresentation(comment?.author)
            } `,
          }),
        );
      },
    };
  };

  const updateActivities = (comment: IssueComment): void => {
    const commentActivity: Array<Record<string, any>> = [
      {
        ...convertCommentsToActivityPage([comment])[0],
        tmp: true,
        timestamp: Date.now(),
        author: currentUser,
      },
    ];
    doCreateActivityModel(
      isNaturalSortOrder
        ? activityPage.concat(commentActivity)
        : commentActivity.concat(activityPage),
    );
  };

  return (
    <>
      <ArticleActivityStream
        activities={activities}
        attachments={article?.attachments}
        uiTheme={uiTheme}
        user={user}
        commentActions={createCommentActions()}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          comment: IssueComment,
        ) => dispatch(articleActions.updateArticleComment(comment))}
        refreshControl={() => renderRefreshControl(() => loadActivities(false))}
        highlight={props.highlight}
      />
      {issuePermissions.articleCanCommentOn(article) && (
        <>
          <ArticleAddComment
            article={article}
            comment={articleCommentDraft}
            onCommentChange={(
              comment: IssueComment,
            ): ((...args: Array<any>) => any) =>
              dispatch(articleActions.updateArticleCommentDraft(comment))
            }
            onSubmitComment={async (
              comment: IssueComment,
            ): ((...args: Array<any>) => any) => {
              updateActivities(comment);
              await dispatch(articleActions.submitArticleCommentDraft(comment));
              refreshActivities(false);
              return Promise.resolve();
            }}
            issuePermissions={issuePermissions}
          />
          <KeyboardSpacerIOS top={98} />
        </>
      )}
    </>
  );
};

export default React.memo<Props>(ArticleActivities) as React$AbstractComponent<
  Props,
  unknown
>;