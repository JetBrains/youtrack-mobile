import usage from 'components/usage/usage';
import {ANALYTICS_ARTICLE_CREATE_PAGE} from 'components/analytics/analytics-ids';
import {attachmentActions} from './article-create__attachment-actions-and-types';
import {confirmDeleteArticleDraft} from 'components/confirmation/article-confirmations';
import {deleteArticle} from 'views/article/arcticle-actions';
import {i18n} from 'components/i18n/i18n';
import {logEvent} from 'components/log/log-helper';
import {notify, notifyError} from 'components/notification/notification';
import {until} from 'util/util';
import {setArticleDraft, setError, setProcessing} from './article-create-reducers';

import type Api from 'components/api/api';
import type {Article, ArticleDraft} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import type {NormalizedAttachment} from 'types/Attachment';
import type {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

const updateArticleDraft = (articleDraft: ArticleDraft): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const [error] = await until<ArticleDraft>(getApi().articles.updateArticleDraft(articleDraft));
    if (error) {
      notifyError(error);
    }
  };
};

const createArticleDraft = (articleId?: string): ReduxAction<Promise<ArticleDraft | void>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const api: Api = getApi();
    dispatch(setProcessing(true));
    const [error, articleDraft] = await until(api.articles.createArticleDraft(articleId));
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

const publishArticleDraft = (articleDraft: ArticleDraft): ReduxAction<Promise<Article | void>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const api: Api = getApi();
    dispatch(setProcessing(true));
    await dispatch(updateArticleDraft(articleDraft));
    const [error, article] = await until<Article>(api.articles.publishArticleDraft(articleDraft.id!));
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

const setDraft = (articleDraft: Article | null): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(setArticleDraft(articleDraft));
  };
};

const showAddAttachDialog = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(attachmentActions.toggleAttachFileDialog(true));
  };
};

const cancelAddAttach = (attach: Attachment): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    await dispatch(attachmentActions.cancelImageAttaching(attach));
  };
};

const hideAddAttachDialog = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(attachmentActions.toggleAttachFileDialog(false));
  };
};

const uploadFile = (files: NormalizedAttachment[]): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const articleDraft: ArticleDraft | null = getState().articleCreate.articleDraft;
    dispatch(attachmentActions.doUploadFile(true, files, articleDraft));
    logEvent({
      message: `Image attached to article ${articleDraft?.id}`,
    });
    usage.trackEvent(ANALYTICS_ARTICLE_CREATE_PAGE, 'Attach image', 'Success');
  };
};

const loadAttachments = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const api: Api = getApi();
    const articleDraft = getState().articleCreate.articleDraft;
    if (articleDraft?.id) {
      const [error, draftAttachments] = await until(api.articles.getAttachments(articleDraft.id));
      if (error) {
        notifyError(error);
      } else {
        dispatch(setDraft({...articleDraft, attachments: draftAttachments} as Article));
      }
    }
  };
};

const deleteDraftAttachment = (attachmentId: string): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const api: Api = getApi();
    const articleDraft = getState().articleCreate.articleDraft;
    if (articleDraft?.id) {
      const [error] = await until(api.articles.deleteDraftAttachment(articleDraft.id, attachmentId));
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
            attachments: (articleDraft.attachments || []).filter((it: Attachment) => it.id !== attachmentId),
          } as Article)
        );
      }
    }

  };
};

const deleteDraft = (): ReduxAction<Promise<void>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const articleDraft: ArticleDraft = getState().articleCreate.articleDraft!;
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
