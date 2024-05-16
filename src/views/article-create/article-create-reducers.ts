import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {attachmentTypes} from './article-create__attachment-actions-and-types';
import {guid} from 'util/util';

import type {Article, ArticleDraft} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import type {CustomError} from 'types/Error';
import {ElementType} from 'react';

export type ArticleCreateState = {
  articleDraft: ArticleDraft | null;
  breadCrumbs: ElementType | null;
  error: CustomError | null;
  isProcessing: boolean;
  isAttachFileDialogVisible: boolean;
  attachingImage: Attachment | null;
  isNew?: boolean;
  originalArticleId?: string;
};

export const articleCreateInitialState: ArticleCreateState = {
  articleDraft: null,
  breadCrumbs: null,
  error: null,
  isProcessing: false,
  isAttachFileDialogVisible: false,
  attachingImage: null,
};

const attachmentReducers = {
  [attachmentTypes.ATTACH_START_ADDING](
    state: ArticleCreateState,
    action: {
      attachingImage: Attachment;
    },
  ) {
    const {attachingImage} = action;
    const attachments: Attachment[] = state?.articleDraft?.attachments || [];
    state.articleDraft = {
      ...state.articleDraft,
      attachments: [...attachments, attachingImage],
    };
    state.attachingImage = {...attachingImage, id: guid()};
  },

  [attachmentTypes.ATTACH_CANCEL_ADDING](
    state: ArticleCreateState,
    action: {
      attachingImage: Record<string, any>;
    },
  ) {
    const {attachingImage} = action;
    state.articleDraft = {
      ...state.articleDraft,
      attachments: (state?.articleDraft?.attachments || []).filter(
        (attachment: Attachment) =>
          attachingImage &&
          attachment.url !== attachingImage.url &&
          attachment.name !== attachingImage.name,
      ),
    };
    state.attachingImage = null;
  },

  [attachmentTypes.ATTACH_REMOVE](
    state: ArticleCreateState,
    action: {
      attachmentId: string;
    },
  ) {
    const attachments: Attachment[] =
      state?.articleDraft?.attachments || [];
    return {
      ...state,
      articleDraft: {
        ...state.articleDraft,
        attachments: attachments.filter(
          attach => attach.id !== action.attachmentId,
        ),
      },
    };
  },

  [attachmentTypes.ATTACH_STOP_ADDING](state: ArticleCreateState) {
    state.attachingImage = null;
  },

  [attachmentTypes.ATTACH_TOGGLE_ADD_FILE_DIALOG](
    state: ArticleCreateState,
    action: {
      isAttachFileDialogVisible: boolean;
    },
  ) {
    state.isAttachFileDialogVisible = action.isAttachFileDialogVisible;
  },

  [attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS](
    state: ArticleCreateState,
    action: {
      attachments: Attachment[];
    },
  ) {
    state.articleDraft = {
      ...state.articleDraft,
      attachments: action.attachments,
    };
  },
};
const {reducer, actions} = createSlice({
  name: 'articleCreate',
  initialState: articleCreateInitialState,
  reducers: {
    setProcessing(state: ArticleCreateState, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },

    setError(state: ArticleCreateState, action: PayloadAction<CustomError>) {
      state.error = action.payload;
    },

    setArticleDraft(state: ArticleCreateState, action: PayloadAction<Article | null>) {
      state.articleDraft = action.payload;
    },
  },
  extraReducers: attachmentReducers,
});
export const {setError, setProcessing, setArticleDraft} = actions;
export default reducer;
