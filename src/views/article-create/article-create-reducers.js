/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {attachmentTypes} from './article-create__attachment-actions-and-types';

import type {Article, ArticleDraft} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';
import type {Attachment} from '../../flow/CustomFields';
import {guid} from '../../util/util';

export type ArticleCreateState = {
  articleDraft: ArticleDraft | null,
  breadCrumbs: React$Element<any> | null,
  error: CustomError,
  isProcessing: boolean,
  isAttachFileDialogVisible: boolean,
  attachingImage: Attachment | null
};

export const articleCreateInitialState: ArticleCreateState = {
  articleDraft: null,
  breadCrumbs: null,
  error: null,
  isProcessing: false,
  isAttachFileDialogVisible: false,
  attachingImage: null
};

const attachmentReducers = {
  //$FlowFixMe
  [attachmentTypes.ATTACH_START_ADDING](state: ArticleCreateState, action: {attachingImage: Object}): ArticleCreateState {
    const {attachingImage} = action;
    const attachments: Array<Attachment> = state?.articleDraft?.attachments || [];
    state.articleDraft = {
      ...state.articleDraft,
      attachments: [...attachments, attachingImage],
    };
    state.attachingImage = {...attachingImage, id: guid()};
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_CANCEL_ADDING](state: ArticleCreateState, action: {attachingImage: Object}): ArticleCreateState {
    const {attachingImage} = action;
    state.articleDraft = {
      ...state.articleDraft,
      attachments: (state?.articleDraft?.attachments || []).filter(
        (attachment: Attachment) => attachment.url !== attachingImage.url && attachment.name !== attachingImage.name
      ),
    };
    state.attachingImage = null;
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_REMOVE](state: ArticleCreateState, action: {attachmentId: string}): ArticleCreateState {
    const attachments: Array<Attachment> = state?.articleDraft?.attachments || [];
    return {
      ...state,
      articleDraft: {
        ...state.articleDraft,
        attachments: attachments.filter(attach => attach.id !== action.attachmentId),
      }
    };
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_STOP_ADDING](state: ArticleCreateState): ArticleCreateState {
    state.attachingImage = null;
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_TOGGLE_ADD_FILE_DIALOG](state: ArticleCreateState, action: {isAttachFileDialogVisible: boolean}): ArticleCreateState {
    state.isAttachFileDialogVisible = action.isAttachFileDialogVisible;
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS](state: ArticleCreateState, action: {attachments: boolean}): ArticleCreateState {
    state.articleDraft = {
      ...state.articleDraft,
      attachments: action.attachments,
    };
  }
};

const {reducer, actions} = createSlice({
  name: 'articleCreate',
  initialState: articleCreateInitialState,
  reducers: {
    setProcessing(state: ArticleCreateState, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
    setError(state: ArticleCreateState, action: PayloadAction<boolean>) {
      state.error = action.payload;
    },
    setArticleDraft(state: ArticleCreateState, action: PayloadAction<Article>) {
      state.articleDraft = action.payload;
    },
  },
  extraReducers: attachmentReducers
});


export const {
  setError,
  setProcessing,
  setArticleDraft,
} = actions;

export default reducer;
