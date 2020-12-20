/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {ON_NAVIGATE_BACK} from '../../actions/action-types';
import {routeMap} from '../../app-routes';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {ActivityItem} from '../../flow/Activity';
import type {Article, ArticlesList} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';

export type ArticleState = {
  activityPage: Array<ActivityItem> | null,
  article: Article,
  articleCommentDraft: Comment | null,
  articleDraft: Article,
  articlesList: ArticlesList,
  error: CustomError,
  isLoading: boolean,
  isProcessing: boolean,
  issuePermissions: ?IssuePermissions,
  prevArticleState: ?ArticleState
};

export const articleInitialState: ArticleState = {
  activityPage: null,
  article: null,
  articleCommentDraft: null,
  articlesList: [],
  articleDraft: null,
  error: null,
  isLoading: false,
  isProcessing: false,
  issuePermissions: null,
  prevArticleState: null
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
      state.article = action.payload;
    },
    setActivityPage(state: ArticleState, action: PayloadAction<Array<ActivityItem>>) {
      state.activityPage = action.payload;
    },
    setArticleDraft(state: ArticleState, action: PayloadAction<Article>) {
      state.articleDraft = action.payload;
    },
    setPrevArticle(state: ArticleState, action: PayloadAction<ArticleState>) {
      state.prevArticleState = action.payload;
    },
    setArticleCommentDraft(state: ArticleState, action: PayloadAction<Article>) {
      state.articleCommentDraft = action.payload;
    },
  },
  extraReducers: {
    [ON_NAVIGATE_BACK]: (
      state: ArticleState,
      action: { closingView: { routeName: string, params: { articlePlaceholder: Article } } }
    ): ArticleState => {
      if (action.closingView.routeName === routeMap.Article) {
        return state.prevArticleState ? state.prevArticleState : articleInitialState;
      }
      return state;
    }
  }
});


export const {
  setLoading,
  setError,
  setArticle,
  setActivityPage,
  setProcessing,
  setArticleDraft,
  setPrevArticle,
  setArticleCommentDraft
} = actions;

export default reducer;
