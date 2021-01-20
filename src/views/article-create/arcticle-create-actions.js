/* @flow */

import {ANALYTICS_ARTICLE_CREATE} from '../../components/analytics/analytics-ids';
import {attachmentActions} from './article-create__attachment-actions-and-types';
import {logEvent} from '../../components/log/log-helper';
import {notify} from '../../components/notification/notification';
import {until} from '../../util/util';
import {
  setArticleDraft,
  setError,
  setProcessing
} from './article-create-reducers';
import usage from '../../components/usage/usage';

import type Api from '../../components/api/api';
import type {AppState} from '../../reducers';
import type {Article, ArticleDraft} from '../../flow/Article';
import type {Attachment} from '../../flow/CustomFields';

type ApiGetter = () => Api;

const updateArticleDraft = (articleDraft: Article) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    const [error] = await until(api.articles.updateArticleDraft(articleDraft));

    if (error) {
      const errorMsg: string = 'Failed to update article draft';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
    }
  };
};

const createArticleDraft = (articleId?: string) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    dispatch(setProcessing(true));
    const [error, articleDraft] = await until(api.articles.createArticleDraft(articleId));
    dispatch(setProcessing(false));

    if (error) {
      const errorMsg: string = 'Failed to create article draft';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
    } else {
      logEvent({message: 'Create article draft', analyticsId: ANALYTICS_ARTICLE_CREATE});
      dispatch(setDraft(articleDraft));
    }
  };
};

const publishArticleDraft = (articleDraft: Article) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();

    dispatch(setProcessing(true));
    await dispatch(updateArticleDraft(articleDraft));
    const [error] = await until(api.articles.publishArticleDraft(articleDraft.id));
    dispatch(setProcessing(false));

    if (error) {
      const errorMsg: string = 'Failed to publish article draft';
      logEvent({message: errorMsg, isError: true});
      notify(errorMsg, error);
      dispatch(setError(error));
    } else {
      dispatch(setDraft(null));
      notify('Article published');
    }
  };
};

const setDraft = (articleDraft: Article | null) => {
  return async (dispatch: (any) => any) => {
    dispatch(setArticleDraft(articleDraft));
  };
};

const showAddAttachDialog = () => {
  return async (dispatch: (any) => any) => {
    dispatch(attachmentActions.toggleAttachFileDialog(true));
  };
};

const cancelAddAttach = (attach: Attachment) => {
  return async (dispatch: (any) => any) => {
    await dispatch(attachmentActions.cancelImageAttaching(attach));
  };
};
const hideAddAttachDialog = () => {
  return async (dispatch: (any) => any) => {
    dispatch(attachmentActions.toggleAttachFileDialog(false));
  };
};

const uploadFile = (attach: Attachment) => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const articleDraft: ArticleDraft = getState().articleCreate.articleDraft || {};

    const [error, updatedDraft] = await until(api.articles.attachFile(articleDraft.id, attach.url, attach.name));
    if (error) {
      const message: string = 'Failed to attach file';
      logEvent({message: message, isError: true});
      notify(message, error);
    } else {
      logEvent({message: `Image attached to article ${updatedDraft.id}`});
      usage.trackEvent(ANALYTICS_ARTICLE_CREATE, 'Attach image', 'Success');

      dispatch(attachmentActions.stopImageAttaching());
      dispatch(attachmentActions.toggleAttachFileDialog(false));
    }
  };
};

const loadAttachments = () => {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    const api: Api = getApi();
    const articleDraft: ArticleDraft = getState().articleCreate.articleDraft || {};

    const [error, draftAttachments] = await until(api.articles.getAttachments(articleDraft.id));
    if (error) {
      const message: string = 'Failed to load article attachments';
      logEvent({message: message, isError: true});
      notify(message, error);
    } else {
      dispatch(setDraft({...articleDraft, attachments: draftAttachments}));
    }
  };
};


export {
  updateArticleDraft,
  createArticleDraft,
  publishArticleDraft,
  setDraft,

  cancelAddAttach,
  hideAddAttachDialog,
  loadAttachments,
  showAddAttachDialog,
  uploadFile
};
