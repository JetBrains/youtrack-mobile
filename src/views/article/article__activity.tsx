import React, {useCallback, useEffect, useState} from 'react';
import {Clipboard, Share} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import * as articleActions from './arcticle-actions';
import ActivityStream from 'components/activity-stream/activity__stream';
import ApiHelper from 'components/api/api__helper';
import ArticleActivityStreamCommentEdit from 'views/article/article__edit-comment';
import ArticleAddComment from './article__add-comment';
import CommentVisibilityControl from 'components/visibility/comment-visibility-control';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import KeyboardSpacerIOS from 'components/platform/keyboard-spacer.ios';
import ReactionsPanel from 'views/issue/activity/issue__activity-reactions-dialog';
import TipActivityActionAccessTouch from 'components/tip/tips/activity-touch-actions';
import usage from 'components/usage/usage';
import {ANALYTICS_ARTICLE_PAGE_STREAM} from 'components/analytics/analytics-ids';
import {convertCommentsToActivityPage, createActivityModel, getReplyToText} from 'components/activity/activity-helper';
import {getApi} from 'components/api/api__instance';
import {getYoutrackWikiProps} from 'views/article/article-helper';
import {guid} from 'util/util';
import {i18n} from 'components/i18n/i18n';
import {logEvent} from 'components/log/log-helper';
import {notify} from 'components/notification/notification';
import {onReactionSelect} from './arcticle-actions';
import {setArticleCommentDraft} from 'views/article/article-reducers';
import {setDraftCommentData} from 'actions/app-actions';
import {updateMarkdownCheckbox} from 'components/wiki/markdown-helper';

import type {Activity, ActivityStreamCommentActions} from 'types/Activity';
import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import {ContextMenuConfig, ContextMenuConfigItem} from 'types/MenuConfig';
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

interface IReactionState {
  isReactionsPanelVisible: boolean;
  currentComment: IssueComment | null;
}

const ArticleActivities = (props: Props) => {
  const {article, uiTheme, renderRefreshControl, issuePermissions} = props;

  const dispatch: ReduxThunkDispatch = useDispatch();

  const activityPage = useSelector((state: AppState) => state.article.activityPage);
  const articleCommentDraft = useSelector((state: AppState) => state.article.articleCommentDraft);
  const configBackendUrl = useSelector((appState: AppState) => appState.app.auth?.config?.backendUrl || '');
  const currentUser = useSelector((state: AppState) => state.app.user);
  const user = useSelector((state: AppState) => state.app.user);
  const workTimeSettings = useSelector((store: AppState) => store.app.workTimeSettings);
  const isReporter = useSelector((state: AppState) => !!state.app.user?.profiles.helpdesk.isReporter);

  const canCommentOn = issuePermissions.articleCanCommentOn(article);
  const isNaturalSortOrder = !!user?.profiles?.appearance?.naturalCommentsOrder;

  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [commentToChangeVisibility, setCommentToChangeVisibility] = useState<IssueComment | null>(null);
  const [editingComment, setEditingComment] = useState<IssueComment | null>(null);
  const [reactionState, setReactionState] = useState<IReactionState>({
    isReactionsPanelVisible: false,
    currentComment: null,
  });

  const onSubmitComment = async (c: IssueComment, isAttachmentChange?: boolean) => {
    return dispatch(articleActions.updateArticleComment(c, isAttachmentChange));
  };

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

  const doCreateActivityModel = useCallback(
    (activitiesPage: Activity[]): void => {
      setActivities(createActivityModel(activitiesPage, isNaturalSortOrder));
    },
    [isNaturalSortOrder]
  );

  useEffect(() => {
    dispatch(
      setDraftCommentData(
        articleActions.updateArticleCommentDraft,
        () => async () => await articleCommentDraft,
        article
      )
    );
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
    const commentActivity: (Activity & {tmp?: boolean})[] = [
      {
        ...convertCommentsToActivityPage([comment])[0],
        tmp: true,
        timestamp: Date.now(),
        author: currentUser as User,
      },
    ];
    doCreateActivityModel(
      isNaturalSortOrder ? activityPage!.concat(commentActivity) : commentActivity.concat(activityPage!)
    );
  };

  const hideReactionsPanel = (): void =>
    setReactionState({
      isReactionsPanelVisible: false,
      currentComment: null,
    });

  const openReactionsPanel = (comment: IssueComment) => {
    setReactionState({
      isReactionsPanelVisible: true,
      currentComment: comment,
    });
  };

  const selectReaction = (comment: IssueComment, reaction: Reaction) => {
    usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Add reaction to comment');
    hideReactionsPanel();
    dispatch(
      onReactionSelect(props?.article?.id, comment, reaction, activities, (updatedActivities: Activity[]) => {
        setActivities(updatedActivities);
      })
    );
  };

  const createCommentActions = (): ActivityStreamCommentActions => {
    return {
      contextMenuConfig: (comment: IssueComment, activityId?: string): ContextMenuConfig => {
        logEvent({
          message: `Show article's comment actions`,
          analyticsId: ANALYTICS_ARTICLE_PAGE_STREAM,
        });
        const getArticleURL: () => string = () =>
          activityId ? `${getApi().config.backendUrl}/articles/${article.idReadable}#focus=Comments-${activityId}` : '';
        return {
          menuTitle: '',
          menuItems: [
            issuePermissions.articleCanUpdateComment(article, comment) && {
              actionKey: guid(),
              actionTitle: i18n('Edit'),
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Edit comment');
                setEditingComment(comment);
              },
            },
            canCommentOn &&
            !issuePermissions.isCurrentUser(comment?.author) && {
              actionKey: guid(),
              actionTitle: i18n('Reply'),
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Reply on comment');
                dispatch(setArticleCommentDraft(getReplyToText(comment.text, comment.author)));
              },
            },
            {
              actionKey: guid(),
              actionTitle: i18n('Add reaction'),
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Add reaction to comment');
                openReactionsPanel(comment);
              },
            },
            issuePermissions.canUpdateCommentVisibility(article) && {
              actionKey: guid(),
              actionTitle: i18n('Update visibility'),
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Change visibility');
                setCommentToChangeVisibility(comment);
              },
            },
            {
              actionKey: guid(),
              actionTitle: i18n('Copy text'),
              execute: () => {
                Clipboard.setString(comment.text);
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Copy comment text');
                notify(i18n('Copied'));
              },
            },
            activityId && {
              actionKey: guid(),
              actionTitle: i18n('Copy link'),
              execute: () => {
                Clipboard.setString(getArticleURL());
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Copy comment URL');
                notify(i18n('Copied'));
              },
            },
            activityId && {
              actionKey: guid(),
              actionTitle: i18n('Share link'),
              execute: () => {
                Share.share(
                  {
                    // url: articleURL as string,
                    // title: articleURL as string,
                    message: getArticleURL(),
                  },
                  {
                    dialogTitle: i18n('Share link'),
                  }
                );
                logEvent({
                  message: 'Share article',
                  analyticsId: ANALYTICS_ARTICLE_PAGE_STREAM,
                });
              },
            },
            issuePermissions.articleCanDeleteComment(article, comment) && {
              actionKey: guid(),
              actionTitle: i18n('Delete'),
              menuAttributes: ['destructive'],
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Delete comment');
                dispatch(articleActions.deleteArticleComment(comment.id));
              },
            },
          ].filter(Boolean) as ContextMenuConfigItem[],
        };
      },
    };
  };

  const getArticleCommentAttachments = (c: IssueComment) => {
    let attachments: Attachment[] = c.attachments || [];
    if (c.attachments && configBackendUrl) {
      attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(c.attachments, configBackendUrl);
    }
    return attachments;
  };

  return (
    <>
      <ActivityStream
        activities={activities}
        attachments={article?.attachments || []}
        uiTheme={uiTheme}
        workTimeSettings={workTimeSettings}
        youtrackWiki={getYoutrackWikiProps()}
        onSelectReaction={selectReaction}
        onReactionPanelOpen={openReactionsPanel}
        currentUser={user!}
        commentActions={createCommentActions()}
        onCheckboxUpdate={(checked: boolean, position: number, comment: IssueComment) => {
          const updatedCommentText: string = updateMarkdownCheckbox(comment.text, position, checked);
          dispatch(
            articleActions.updateArticleComment({
              ...comment,
              text: updatedCommentText,
            })
          );
        }}
        refreshControl={() => renderRefreshControl(() => loadActivities(false))}
        highlight={props.highlight}
        onUpdate={refreshActivities}
        isReporter={isReporter}
      />
      {reactionState.isReactionsPanelVisible && (
        <ReactionsPanel
          onSelect={(reaction: Reaction) => {
            selectReaction(reactionState.currentComment as IssueComment, reaction);
          }}
          onHide={hideReactionsPanel}
        />
      )}
      {!!commentToChangeVisibility && (
        <CommentVisibilityControl
          forceChange
          commentId={commentToChangeVisibility.id}
          entity={article}
          onUpdate={() => {
            setCommentToChangeVisibility(null);
            refreshActivities();
          }}
          visibility={commentToChangeVisibility.visibility!}
        />
      )}

      {canCommentOn && (
        <>
          {!editingComment && (
            <ArticleAddComment
              article={article}
              comment={articleCommentDraft}
              onCommentChange={(c: IssueComment) => dispatch(articleActions.updateArticleCommentDraft(c))}
              onSubmitComment={async (c: IssueComment) => {
                updateActivities(c);
                await dispatch(articleActions.submitArticleCommentDraft(c));
                refreshActivities(false);
                return Promise.resolve();
              }}
            />
          )}
          {editingComment && (
            <ArticleActivityStreamCommentEdit
              article={article}
              issuePermissions={issuePermissions}
              comment={{...editingComment, attachments: getArticleCommentAttachments(editingComment)}}
              onCommentChange={async (c: IssueComment, isAttachmentChange?: boolean) =>
                isAttachmentChange ? await onSubmitComment(c, isAttachmentChange) : Promise.resolve(c)
              }
              onSubmitComment={async (c: IssueComment) => {
                await onSubmitComment(c);
                setEditingComment(null);
              }}
            />
          )}
          <KeyboardSpacerIOS top={98} />
        </>
      )}
      <TipActivityActionAccessTouch canAddComment={canCommentOn} />
    </>
  );
};

export default React.memo<Props>(ArticleActivities);
