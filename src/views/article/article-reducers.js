/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {ActivityItem} from '../../flow/Activity';
import type {Article} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';

export type ArticleState = {
  activityPage: Array<ActivityItem> | null,
  article: Article,
  articleDraft: Article,
  editMode: boolean,
  error: CustomError,
  isLoading: boolean,
  isProcessing: boolean,
  issuePermissions: ?IssuePermissions
};

const articleInitialState: ArticleState = {
  activityPage: null,
  article: null,
  articleDraft: null,
  editMode: false,
  error: null,
  isLoading: false,
  isProcessing: false,
  issuePermissions: null
};

const {reducer, actions} = createSlice({
  name: 'article',
  initialState: articleInitialState,
  reducers: {
    setLoading(state: ArticleState, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setProcessing(state: ArticleState, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
    setError(state: ArticleState, action: PayloadAction<boolean>) {
      state.error = action.payload;
    },
    setArticle(state: ArticleState, action: PayloadAction<Article>) {
      state.article = {...state.article, ...action.payload};
    },
    setActivityPage(state: ArticleState, action: PayloadAction<Array<ActivityItem>>) {
      state.activityPage = action.payload;
    },
    setEditMode(state: ArticleState, action: PayloadAction<boolean>) {
      state.editMode = action.payload;
    },
    setArticleDraft(state: ArticleState, action: PayloadAction<Article>) {
      state.articleDraft = {...action.payload};
    },
  }
});


export const {setLoading, setError, setArticle, setActivityPage, setProcessing, setEditMode, setArticleDraft} = actions;
export default reducer;
