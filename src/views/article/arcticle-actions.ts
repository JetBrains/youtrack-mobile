import {Alert, Clipboard, Share} from 'react-native';

import {ActionSheetProvider} from '@expo/react-native-action-sheet';

import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {
  ANALYTICS_ARTICLE_PAGE,
  ANALYTICS_ARTICLE_PAGE_STREAM,
} from 'components/analytics/analytics-ids';
import {cacheUserLastVisitedArticle, setGlobalInProgress} from 'actions/app-actions';
import {confirmDeleteArticle} from 'components/confirmation/article-confirmations';
import {findActivityInGroupedActivities} from 'components/activity/activity-helper';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {getStorageState} from 'components/storage/storage';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {isIOSPlatform, until} from 'util/util';
import {logEvent} from 'components/log/log-helper';
import {notify, notifyError} from 'components/notification/notification';
import {
  setActivityPage,
  setArticle,
  setArticleCommentDraft,
  setDefaultTeam,
  setError,
  setPrevArticle,
  setProcessing,
} from './article-reducers';
import {
  showActions,
  showActionSheet,
} from 'components/action-sheet/action-sheet';
import {updateActivityCommentReactions} from 'components/activity-stream/activity__stream-helper';

import type Api from 'components/api/api';
import type {ActionSheetOption} from 'components/action-sheet/action-sheet';
import type {Activity, ActivityPositionData} from 'types/Activity';
import type {Article, ArticleDraft} from 'types/Article';
import type {ArticleState} from './article-reducers';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {CustomError} from 'types/Error';
import type {ProjectTeam} from 'types/Project';
import type {Reaction} from 'types/Reaction';
import type {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';
import type {ShowActionSheetWithOptions} from 'components/action-sheet/action-sheet';
import type {UserMentions} from 'types/User';

const clearArticle = (): ReduxAction => async (dispatch: ReduxThunkDispatch) =>
  dispatch(setArticle(null));

const loadArticleFromCache = (article: Article): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    const cachedArticleLastVisited: {
      article?: Article;
      activities?: Activity[];
    } | null = getStorageState().articleLastVisited;

    if (
      !cachedArticleLastVisited ||
      !cachedArticleLastVisited.article ||
      !article
    ) {
      return;
    }

    if (
      article?.id === cachedArticleLastVisited.article?.id ||
      article?.idReadable === cachedArticleLastVisited.article?.idReadable
    ) {
      dispatch(setArticle(cachedArticleLastVisited.article));
    }
  };
};

const loadDefaultTeam = (article: Article): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    logEvent({
      message: 'Loading default article project team',
    });
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    if (isOffline || !article.project?.id) {
      return;
    }
    const [error, team] = await until<ProjectTeam>(getApi().projects.getTeam(article.project.id));

    if (error) {
      dispatch(setError(error));
      logEvent({
        message: 'Failed to load default article project team',
        isError: true,
      });
    } else {
      dispatch(setDefaultTeam(team));
    }
  };
};


const loadArticle = (articleId: string, reset: boolean = true): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    logEvent({
      message: 'Loading article',
    });
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    if (isOffline) {
      return;
    }
    dispatch(setGlobalInProgress(true));
    if (reset) {
      dispatch(setArticle(null));
    }
    const [error, article] = await until<Article>(getApi().articles.getArticle(articleId));
    dispatch(setGlobalInProgress(false));

    if (error) {
      dispatch(setError(error));
      logEvent({
        message: 'Failed to load articles',
        isError: true,
      });
    } else {
      logEvent({
        message: 'Article loaded',
      });
      dispatch(setArticle(article));
      dispatch(loadDefaultTeam(article));
      cacheUserLastVisitedArticle(article);
    }
  };
};

const loadCachedActivitiesPage = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    const cachedArticleLastVisited: {
      article?: Article;
      activities?: Activity[];
    } | null = getStorageState().articleLastVisited;

    if (cachedArticleLastVisited && cachedArticleLastVisited.activities) {
      dispatch(setActivityPage(cachedArticleLastVisited.activities));
    }
  };
};

const loadActivitiesPage = (reset: boolean = true): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    const article = getState().article.article;
    if (isOffline || !article) {
      return;
    }

    dispatch(setGlobalInProgress(true));

    if (reset) {
      dispatch(setActivityPage(null));
    }

    const [error, activityPage] = await until(
      getApi().articles.getActivitiesPage(article.id),
    );
    dispatch(setGlobalInProgress(false));

    if (error) {
      dispatch(setError(error));
      logEvent({
        message: 'Failed to load articles activities',
        isError: true,
      });
    } else {
      dispatch(setActivityPage(activityPage.activities));
      cacheUserLastVisitedArticle(article, activityPage.activities);
      logEvent({
        message: 'Articles activity page loaded',
      });
    }
  };
};

const showArticleActions = (
  actionSheet: typeof ActionSheetProvider,
  canUpdate: boolean,
  canDelete: boolean,
  renderBreadCrumbs: (...args: any[]) => any,
  canStar: boolean,
  hasStar: boolean,
  isTablet: boolean,
): ReduxAction => {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    logEvent({
      message: 'Show article actions',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    const api: Api = getApi();
    const article = getState().article.article;
    if (!article) {
      return;
    }
    const url: string = `${api.config.backendUrl}/articles/${article.idReadable}`;
    const actions: ActionSheetOption[] = [
      {
        title: i18n('Share…'),
        execute: () => {
          const msg: string = i18n('Share link to article');

          if (isIOSPlatform()) {
            Share.share({
              url,
            });
          } else {
            Share.share(
              {
                title: article.summary,
                message: url,
              },
              {
                dialogTitle: msg,
              },
            );
          }

          logEvent({
            message: msg,
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
        },
      },
      {
        title: i18n('Copy link to article'),
        execute: () => {
          Clipboard.setString(url);
          logEvent({
            message: i18n('Copy link to article'),
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
        },
      },
    ];

    if (canStar) {
      const title: string = hasStar
        ? i18n('Remove favorite')
        : i18n('Add to favorites');
      actions.push({
        title: title,
        execute: async () => {
          logEvent({
            message: `Article: ${title}`,
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
          notify(
            hasStar
              ? i18n('Article removed from favorites')
              : i18n('Article added to favorites'),
          );
          dispatch(toggleFavorite());
        },
      });
    }

    if (canUpdate) {
      actions.push({
        title: i18n('Edit'),
        execute: async () => {
          logEvent({
            message: 'Edit article',
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
          setProcessing(true);
          const articleDrafts = await getUnpublishedArticleDraft(
            api,
            article,
          );
          setProcessing(false);
          Router.ArticleCreate({
            originalArticleIdReadable: article.idReadable,
            originalArticleId: article.id,
            articleDraft: Array.isArray(articleDrafts)
              ? articleDrafts[0]
              : articleDrafts,
            breadCrumbs: renderBreadCrumbs(),
            isTablet,
          });
        },
      });
    }

    if (canDelete) {
      actions.push({
        title: i18n('Delete'),
        execute: async () => {
          logEvent({
            message: 'Delete article',
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
          confirmDeleteArticle()
            .then(() =>
              dispatch(deleteArticle(article, () => Router.KnowledgeBase())),
            )
            .catch(() => {});
        },
      });
    }

    actions.push({
      title: i18n('Cancel'),
    });
    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
};

const getUnpublishedArticleDraft = async (api: Api, article: Article): Promise<ArticleDraft | null> => {
  let articleDraft: ArticleDraft;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, articleDrafts] = await until(
    api.articles.getArticleDrafts(article.id),
  );

  if (articleDrafts && articleDrafts[0]) {
    articleDraft = articleDrafts[0];
  } else {
    const [err, draft] = await until(
      api.articles.createArticleDraft(article.id),
    );

    if (err) {
      logEvent({
        message: `Failed to create article draft`,
        isError: true,
      });
    }

    articleDraft = {
      attachments: article.attachments,
      summary: article.summary,
      content: article.content,
      project: article.project,
      visibility: article.visibility,
      ...(err ? {} : draft),
    };
  }

  return articleDraft;
};

export const createArticleDraft = async (
  api: Api,
  article: Article,
  createSubArticle: boolean = false,
): Promise<ArticleDraft | null> => {
  let articleDraft: Article | null = null;
  const [createDraftError, draft] = await until(
    createSubArticle
      ? api.articles.createSubArticleDraft(article)
      : api.articles.createArticleDraft(article.id),
  );

  if (createDraftError) {
    logEvent({
      message: `Failed to create a draft for the article ${article.idReadable}`,
      isError: true,
    });
  } else {
    articleDraft = draft;
  }

  return articleDraft;
};

const deleteArticle = (article: Article | ArticleDraft, onAfterDelete?: () => void): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    logEvent({
      message: 'Delete article',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    dispatch(setProcessing(true));
    const articleId = article.id || '';
    const [error] = await until(
      hasType.articleDraft({$type: article.$type || ''})
        ? getApi().articles.deleteDraft(articleId)
        : getApi().articles.deleteArticle(articleId),
    );
    dispatch(setProcessing(false));

    if (error) {
      notifyError(error);
    } else if (onAfterDelete) {
      onAfterDelete();
    }
  };
};

const setPreviousArticle = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const articleState: ArticleState = getState().article;
    dispatch(setPrevArticle(articleState));
  };
};

const getArticleCommentDraft = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const article = getState().article.article;
    if (!article) {
      return;
    }
    const [error, draftComment] = await until(
      getApi().articles.getCommentDraft(article.id),
    );

    if (!error && draftComment) {
      dispatch(setArticleCommentDraft(draftComment));
    }
  };
};

const updateArticleCommentDraft = (comment: IssueComment): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const articleId: string | undefined = comment?.article?.id || getState()?.article?.article?.id;
    if (!articleId) {
      return null;
    }
    const [error, updatedCommentDraft] = await until(
      getApi().articles.updateCommentDraft(articleId, comment),
    );

    if (error) {
      notifyError(error);
    } else {
      dispatch(setArticleCommentDraft(updatedCommentDraft));
    }

    return error ? null : updatedCommentDraft;
  };
};

const resetArticleCommentDraft = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(setArticleCommentDraft(null));
  };
};

const submitArticleCommentDraft = (commentDraft: IssueComment): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const articleId: string | undefined = commentDraft?.article?.id || getState()?.article?.article?.id;
    logEvent({
      message: 'Submit article draft',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    if (!articleId) {
      return;
    }
    await dispatch(updateArticleCommentDraft(commentDraft));
    const [error] = await until(
      getApi().articles.submitCommentDraft(articleId, commentDraft.id),
    );

    if (error) {
      notifyError(error);
    } else {
      logEvent({
        message: 'Comment added',
        analyticsId: ANALYTICS_ARTICLE_PAGE,
      });
      dispatch(resetArticleCommentDraft());
    }
  };
};

const updateArticleComment = (
  comment: IssueComment,
  isAttachmentChange?: boolean
): ReduxAction<Promise<IssueComment | null>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const articleId: string | undefined = comment?.article?.id || getState()?.article?.article?.id;
    logEvent({
      message: 'Update article comment',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    if (!articleId) {
      return null;
    }
    const [error, c] = await until<IssueComment>(getApi().articles.updateComment(articleId, comment));

    if (isAttachmentChange) {
      notify(i18n('Comment updated'));
    }
    if (error) {
      notifyError(error);
      return null;
    } else {
      logEvent({
        message: 'Comment updated',
        analyticsId: ANALYTICS_ARTICLE_PAGE,
      });
      dispatch(loadActivitiesPage());
      return c;
    }
  };
};

const deleteArticleComment = (commentId: string): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    logEvent({
      message: 'Delete article comment',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    const article = getState().article.article;
    if (!article) {
      return;
    }

    try {
      await new Promise(
        (
          resolve: (...args: any[]) => any,
          reject: (...args: any[]) => any,
        ) => {
          Alert.alert(
            'Are you sure you want to delete this comment?',
            '',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: reject,
              },
              {
                text: 'Delete',
                onPress: resolve,
              },
            ],
            {
              cancelable: true,
            },
          );
        },
      );
      const [error] = await until(
        getApi().articles.deleteComment(article.id, commentId),
      );

      if (error) {
        notifyError(error);
      } else {
        dispatch(loadActivitiesPage());
      }
    } catch (error) {
      //
    }
  };
};

const showArticleCommentActions = (
  showActionSheetWithOptions: ShowActionSheetWithOptions,
  comment: IssueComment,
  activityId: string,
  canDeleteComment: boolean,
): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const article = getState().article.article;
    if (!article) {
      return;
    }
    logEvent({
      message: 'Show article\'s comment actions',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    const url: string = `${getApi().config.backendUrl}/articles/${article.idReadable}#comment${activityId}`;
    const commentText = comment.text;
    const options: ActionSheetOption[] = [
      {
        title: i18n('Share…'),
        execute: function (): string {
          const params: Record<string, any> = {};
          const isIOS: boolean = isIOSPlatform();

          if (isIOS) {
            params.url = url;
          } else {
            params.title = commentText;
            params.message = url;
          }

          Share.share(params, {
            dialogTitle: i18n('Share link'),
          });
          logEvent({
            message: 'Share article',
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
          return this.title;
        },
      },
      {
        title: i18n('Copy link'),
        execute: function (): string {
          logEvent({
            message: 'Copy link to article',
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
          Clipboard.setString(url);
          return this.title;
        },
      },
    ];

    if (canDeleteComment) {
      options.push({
        title: i18n('Delete'),
        execute: function () {
          logEvent({
            message: 'Delete article',
            analyticsId: ANALYTICS_ARTICLE_PAGE,
          });
          dispatch(deleteArticleComment(comment.id));
          return this.title;
        },
      });
    }

    options.push({
      title: i18n('Cancel'),
    });
    const selectedAction = await showActionSheet(
      options,
      showActionSheetWithOptions,
      comment?.author ? getEntityPresentation(comment.author) : '',
      commentText.length > 155 ? `${commentText.substr(0, 153)}…` : commentText,
    );

    if (selectedAction && selectedAction.execute) {
      const actionTitle: string = selectedAction.execute();
      logEvent({
        message: `comment ${actionTitle}`,
        analyticsId: ANALYTICS_ARTICLE_PAGE,
      });
    }
  };
};

const getMentions = (query: string): ReduxAction<Promise<UserMentions>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    logEvent({
      message: 'Get article mentions',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    const article = getState().article.article;
    if (!article) {
      return;
    }
    const [error, mentions] = await until(
      getApi().mentions.getMentions(query, {
        containers: [
          {
            $type: article.$type,
            id: article.id,
          },
        ],
      }),
    );

    if (error) {
      notifyError(error);
      return null;
    }

    return mentions;
  };
};

const toggleFavorite = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const article = getState().article.article;
    logEvent({
      message: 'Toggle article star',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    if (!article) {
      return;
    }
    const prev: boolean = article.hasStar;
    dispatch(setArticle({...article, hasStar: !prev}));
    const [error] = await until(
      getApi().articles.updateArticle(article.id, {
        hasStar: !prev,
      }),
    );

    if (error) {
      notifyError(error);
      dispatch(setArticle({...article, hasStar: prev}));
    }
  };
};

const deleteAttachment = (
  attachmentId: string,
): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    logEvent({
      message: 'Delete article attachment',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    const article = getState().article.article;
    if (!article) {
      return;
    }
    const [error] = await until(
      getApi().articles.deleteAttachment(article.id, attachmentId),
    );

    if (error) {
      notifyError(error);
    } else {
      logEvent({
        message: 'Attachment deleted',
        analyticsId: ANALYTICS_ARTICLE_PAGE,
      });
      dispatch(
        setArticle({
          ...article,
          attachments: article.attachments.filter(
            (it: Attachment) => it.id !== attachmentId,
          ),
        }),
      );
    }
  };
};

const createSubArticleDraft = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    logEvent({
      message: 'Create sub-article',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    const article = getState().article.article!;
    return await createArticleDraft(getApi(), article, true);
  };
};

const onCheckboxUpdate =
  (articleContent: string): ReduxAction =>
  async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    logEvent({
      message: 'Checkbox updated',
      analyticsId: ANALYTICS_ARTICLE_PAGE,
    });
    const article = getState().article.article;
    if (!article) {
      return;
    }
    const updatedArticle: Article = {...article, content: articleContent};
    dispatch(setArticle({...article, content: articleContent}));
    const [error] = await until(
      getApi().articles.updateArticle(
        article.id,
        {
          content: articleContent,
        },
        'content'
      )
    );

    if (error) {
      notifyError(error);
      await dispatch(setArticle(article));
    } else {
      cacheUserLastVisitedArticle(updatedArticle);
    }
  };

function onReactionSelect(
  articleId: string,
  comment: IssueComment,
  reaction: Reaction,
  activities: Activity[] | null,
  onReactionUpdate: (activities: Activity[], error?: CustomError) => void,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const currentUser = getState().app.user!;
    usage.trackEvent(ANALYTICS_ARTICLE_PAGE_STREAM, 'Reaction select');
    const reactionName: string = reaction.reaction;
    const existReaction: Reaction = (comment.reactions || []).filter(
      (it: Reaction) =>
        it.reaction === reactionName && it.author.id === currentUser!.id,
    )[0];
    const [error, commentReaction] = await until(
      existReaction
        ? getApi().articles.removeCommentReaction(articleId, comment.id, existReaction.id)
        : getApi().articles.addCommentReaction(articleId, comment.id, reactionName),
    );

    if (error) {
      notifyError(error);
    } else {
      const targetActivityData:
        | ActivityPositionData
        | null
        | undefined = findActivityInGroupedActivities(activities, comment.id);

      if (targetActivityData) {
        const _comment = updateActivityCommentReactions({
          comment,
          currentUser,
          reaction: existReaction ? reaction : commentReaction,
        });

        const newActivities: Activity[] = activities.slice(0);
        const targetActivity: Activity | null | undefined =
          newActivities[targetActivityData.index];

        if (targetActivity && Array.isArray(targetActivity?.comment?.added)) {
          targetActivity.comment.added = [_comment];
          onReactionUpdate(newActivities);
        }
      }
    }
  };
}

export {
  clearArticle,
  createSubArticleDraft,
  loadArticle,
  loadActivitiesPage,
  loadCachedActivitiesPage,
  loadArticleFromCache,
  showArticleActions,
  setPreviousArticle,
  deleteArticle,
  getArticleCommentDraft,
  updateArticleCommentDraft,
  submitArticleCommentDraft,
  updateArticleComment,
  showArticleCommentActions,
  deleteArticleComment,
  getMentions,
  toggleFavorite,
  deleteAttachment,
  onCheckboxUpdate,
  onReactionSelect,
  resetArticleCommentDraft,
  loadDefaultTeam,
};
