import usage from 'components/usage/usage';
import {ANALYTICS_ARTICLE_CREATE_PAGE} from 'components/analytics/analytics-ids';
import {attachmentActions} from './article-create__attachment-actions-and-types';
import {confirmDeleteArticleDraft} from 'components/confirmation/article-confirmations';
import {deleteArticle} from 'views/article/arcticle-actions';
import {i18n} from 'components/i18n/i18n';
import {logEvent} from 'components/log/log-helper';
import {notify, notifyError} from 'components/notification/notification';
import {until} from 'util/util';
import {
  setArticleDraft,
  setError,
  setProcessing,
} from './article-create-reducers';

import type Api from 'components/api/api';
import type {AppState} from 'reducers';
import type {Article, ArticleDraft} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import {CustomError} from 'types/Error';
import {NormalizedAttachment} from 'types/Attachment';

type ApiGetter = () => Api;

const updateArticleDraft = (
  articleDraft: Article,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const api: Api = getApi();
    const [error] = await until(api.articles.updateArticleDraft(articleDraft));

    if (error) {
      notifyError(error);
    }
  };
};

const createArticleDraft = (
  articleId?: string,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> | Promise<any>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const api: Api = getApi();
    dispatch(setProcessing(true));
    const [error, articleDraft] = await until(
      api.articles.createArticleDraft(articleId),
    );
    dispatch(setProcessing(false));

    if (error) {
      notifyError(error);
    } else {
      logEvent({
        message: 'Create article draft',
        analyticsId: ANALYTICS_ARTICLE_CREATE_PAGE,
      });
      dispatch(setDraft(articleDraft));
      return articleDraft;
    }
  };
};

const publishArticleDraft = (
  articleDraft: Article,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<Article | void>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ): Promise<Article | void> => {
    const api: Api = getApi();
    dispatch(setProcessing(true));
    await dispatch(updateArticleDraft(articleDraft));
    const [error, article]: [CustomError | null, Article[]] = await until(
      api.articles.publishArticleDraft(articleDraft.id),
    );
    dispatch(setProcessing(false));

    if (error) {
      notifyError(error);
      dispatch(setError(error));
    } else {
      dispatch(setDraft(null));
      notify(i18n('Article published'));
      return article;
    }
  };
};

const setDraft = (
  articleDraft: Article | null,
): ((dispatch: (arg0: any) => any) => Promise<void>) => {
  return async (dispatch: (arg0: any) => any) => {
    dispatch(setArticleDraft(articleDraft));
  };
};

const showAddAttachDialog = (): ((
  dispatch: (arg0: any) => any,
) => Promise<void>) => {
  return async (dispatch: (arg0: any) => any) => {
    dispatch(attachmentActions.toggleAttachFileDialog(true));
  };
};

const cancelAddAttach = (
  attach: Attachment,
): ((dispatch: (arg0: any) => any) => Promise<void>) => {
  return async (dispatch: (arg0: any) => any) => {
    await dispatch(attachmentActions.cancelImageAttaching(attach));
  };
};

const hideAddAttachDialog = (): ((
  dispatch: (arg0: any) => any,
) => Promise<void>) => {
  return async (dispatch: (arg0: any) => any) => {
    dispatch(attachmentActions.toggleAttachFileDialog(false));
  };
};

const uploadFile = (
  files: NormalizedAttachment[],
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const articleDraft: ArticleDraft | null = getState().articleCreate.articleDraft;
    dispatch(attachmentActions.doUploadFile(
      true,
      files,
      articleDraft,
    ));
    logEvent({
      message: `Image attached to article ${articleDraft?.id}`,
    });
    usage.trackEvent(
      ANALYTICS_ARTICLE_CREATE_PAGE,
      'Attach image',
      'Success',
    );
  };
};

const loadAttachments = (): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const api: Api = getApi();
    const articleDraft: ArticleDraft =
      getState().articleCreate.articleDraft || {};
    const [error, draftAttachments] = await until(
      api.articles.getAttachments(articleDraft.id),
    );

    if (error) {
      notifyError(error);
    } else {
      dispatch(setDraft({...articleDraft, attachments: draftAttachments}));
    }
  };
};

const deleteDraftAttachment = (
  attachmentId: string,
): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void>) => {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const api: Api = getApi();
    const articleDraft: ArticleDraft = getState().articleCreate.articleDraft;
    const [error] = await until(
      api.articles.deleteDraftAttachment(articleDraft.id, attachmentId),
    );

    if (error) {
      notifyError(error);
    } else {
      logEvent({
        message: 'Attachment deleted',
        analyticsId: ANALYTICS_ARTICLE_CREATE_PAGE,
      });
      dispatch(
        setDraft({
          ...articleDraft,
          attachments: articleDraft.attachments.filter(
            (it: Attachment) => it.id !== attachmentId,
          ),
        }),
      );
    }
  };
};

const deleteDraft = (): ((
  dispatch: (arg0: any) => any,
  getState: () => AppState,
) => Promise<void>) => {
  return async (dispatch: (arg0: any) => any, getState: () => AppState) => {
    const articleDraft: ArticleDraft = getState().articleCreate.articleDraft;
    return confirmDeleteArticleDraft().then(async () => {
      dispatch(setProcessing(true));
      await dispatch(deleteArticle(articleDraft));
      dispatch(setProcessing(false));
    });
  };
};

export {
  createArticleDraft,
  deleteDraft,
  publishArticleDraft,
  setDraft,
  updateArticleDraft,
  cancelAddAttach,
  deleteDraftAttachment,
  hideAddAttachDialog,
  loadAttachments,
  showAddAttachDialog,
  uploadFile,
};
