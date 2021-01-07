/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type {Article} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';

export type ArticleCreateState = {
  articleDraft: Article | null,
  error: CustomError,
  isProcessing: boolean,
};

export const articleCreateInitialState: ArticleCreateState = {
  articleDraft: null,
  error: null,
  isProcessing: false,
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
  extraReducers: {}
});


export const {
  setError,
  setProcessing,
  setArticleDraft,
} = actions;

export default reducer;
