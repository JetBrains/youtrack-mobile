/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type {ActivityItem} from '../../flow/Activity';
import type {Article} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';

export type ArticleState = {
  activityPage: Array<ActivityItem> | null,
  article: Article,
  error: CustomError,
  isLoading: boolean
};

const articleInitialState: ArticleState = {
  activityPage: null,
  article: null,
  error: null,
  isLoading: false
};

const {reducer, actions} = createSlice({
  name: 'article',
  initialState: articleInitialState,
  reducers: {
    setLoading(state: ArticleState, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state: ArticleState, action: PayloadAction<boolean>) {
      state.error = action.payload;
    },
    setArticle(state: ArticleState, action: PayloadAction<Article>) {
      state.article = {...state.article, ...action.payload};
    },
    setActivityPage(state: ArticleState, action: PayloadAction<>) {
      state.activityPage = action.payload;
    }
  }
});


export const {setLoading, setError, setArticle, setActivityPage} = actions;
export default reducer;
