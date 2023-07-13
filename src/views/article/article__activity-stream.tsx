import React, {useEffect, useState} from 'react';
import {Clipboard, Share} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import * as articleActions from 'views/article/arcticle-actions';
import ApiHelper from 'components/api/api__helper';
import ArticleActivityStreamCommentEdit from 'views/article/article__edit-comment';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import ReactionsPanel from '../issue/activity/issue__activity-reactions-dialog';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {ActivityStream} from 'components/activity-stream/activity__stream';
import {ANALYTICS_ARTICLE_PAGE_STREAM} from 'components/analytics/analytics-ids';
import {ContextMenuConfig, ContextMenuConfigItem} from 'types/MenuConfig';
import {getApi} from 'components/api/api__instance';
import {getReplyToText} from 'components/activity/activity-helper';
import {guid} from 'util/util';
import {i18n} from 'components/i18n/i18n';
import {logEvent} from 'components/log/log-helper';
import {notify} from 'components/notification/notification';
import {onReactionSelect} from './arcticle-actions';
import {setArticleCommentDraft} from 'views/article/article-reducers';
import {SkeletonIssueActivities} from 'components/skeleton/skeleton';
import {updateMarkdownCheckbox} from 'components/wiki/markdown-helper';

import type {
  Activity,
  ActivityStreamCommentActions,
} from 'types/Activity';
import type {AppState} from 'reducers';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';
import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {WorkTimeSettings} from 'types/Work';
import type {YouTrackWiki} from 'types/Wiki';
import {Article} from 'types/Article';

interface Props {
  article: Article;
  activities: Activity[] | null;
  attachments: Attachment[];
  uiTheme: UITheme;
  user: User | null;
  onCheckboxUpdate?: (
    checked: boolean,
    position: number,
    comment: IssueComment,
  ) => void;
  renderHeader?: () => any;
  refreshControl: () => any;
  highlight?: {
    activityId?: string;
    commentId?: string;
  };
}

interface IReactionState {
  isReactionsPanelVisible: boolean;
  currentComment: IssueComment | null;
}

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
    article,
    activities,
    attachments,
    uiTheme,
    user,
    onCheckboxUpdate,
  } = props;

  const issuePermissions: IssuePermissions = useSelector((appState: AppState) => appState.app.issuePermissions);
  const configBackendUrl: string = useSelector(
    (appState: AppState) => appState.app.auth?.config?.backendUrl || '',
  );

  const [_activities, setActivities] = useState<Activity[] | null>(activities);

  useEffect(() => {
    setActivities(props.activities);
  }, [props.activities]);

  const [reactionState, setReactionState] = useState<IReactionState>({
    isReactionsPanelVisible: false,
    currentComment: null,
  });

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
      onReactionSelect(
        props?.article?.id,
        comment,
        reaction,
        _activities,
        (updatedActivities: Activity[]) => {
          setActivities(updatedActivities);
        },
      ),
    );
  };

  const workTimeSettings: WorkTimeSettings = useSelector(
    (store: AppState) => store.app.workTimeSettings,
  );
  const isLoading: boolean = useSelector(
    (store: AppState) => store.article.isLoading,
  );

  const createCommentActions = (): ActivityStreamCommentActions => {
    return {
      contextMenuConfig: (comment: IssueComment, activityId?: string): ContextMenuConfig => {
        logEvent({
          message: 'Show article\'s comment actions',
          analyticsId: ANALYTICS_ARTICLE_PAGE_STREAM,
        });
        const getArticleURL: () => string = () => (
          activityId ? `${getApi().config.backendUrl}/articles/${article.idReadable}#focus=Comments-${activityId}` : ''
        );
        return {
          menuTitle: '',
          menuItems: [
            (issuePermissions.articleCanUpdateComment(article, comment) && {
              actionKey: guid(),
              actionTitle: i18n('Edit'),
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Edit comment');
                let attachments: Attachment[] = comment.attachments || [];
                if (comment.attachments && configBackendUrl) {
                  attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
                    comment.attachments,
                    configBackendUrl,
                  );
                }
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Edit comment');
                const onSubmitComment = (comment: IssueComment, isAttachmentChange?: boolean) => {
                  dispatch(articleActions.updateArticleComment(comment, isAttachmentChange));
                };
                Router.PageModal({
                  children: (
                    <ArticleActivityStreamCommentEdit
                      article={article}
                      issuePermissions={issuePermissions}
                      comment={{...comment, attachments}}
                      onCommentChange={async (comment: IssueComment, isAttachmentChange: boolean) => (
                        isAttachmentChange
                          ? await onSubmitComment(comment, isAttachmentChange)
                          : Promise.resolve(comment)
                      )}
                      onSubmitComment={onSubmitComment}
                    />
                  ),
                });
              },
            }),
            (issuePermissions.articleCanCommentOn(article) && !issuePermissions.isCurrentUser(comment?.author) && {
              actionKey: guid(),
              actionTitle: i18n('Reply'),
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Reply on comment');
                dispatch(setArticleCommentDraft(getReplyToText(comment.text, comment.author)),);
              },
            }),
            {
              actionKey: guid(),
              actionTitle: i18n('Add reaction'),
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Add reaction to comment');
                openReactionsPanel(comment);
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
            (activityId && {
              actionKey: guid(),
              actionTitle: i18n('Copy link'),
              execute: () => {
                Clipboard.setString(getArticleURL());
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Copy comment URL');
                notify(i18n('Copied'));
              },
            }),
            (activityId && {
              actionKey: guid(),
              actionTitle: i18n('Share link'),
              execute: () => {
                Share.share({
                  // url: articleURL as string,
                  // title: articleURL as string,
                  message: getArticleURL(),
                }, {
                  dialogTitle: i18n('Share link'),
                });
                logEvent({
                  message: 'Share article',
                  analyticsId: ANALYTICS_ARTICLE_PAGE_STREAM,
                });
              },
            }),
            (issuePermissions.articleCanDeleteComment(article, comment) && {
              actionKey: guid(),
              actionTitle: i18n('Delete'),
              menuAttributes: ['destructive'],
              execute: () => {
                usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Delete comment');
                dispatch(articleActions.deleteArticleComment(comment.id));
              },
            }),
          ].filter(Boolean) as ContextMenuConfigItem[],
        };
      },

    };
  };

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
        onReactionPanelOpen={openReactionsPanel}
        currentUser={user}
        commentActions={createCommentActions()}
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
            selectReaction(reactionState.currentComment as IssueComment, reaction);
          }}
          onHide={hideReactionsPanel}
        />
      )}
    </>
  );
};

export default React.memo<Props>(ArticleActivityStream);
