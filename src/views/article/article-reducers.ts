import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {issuePermissionsNull} from 'components/issue-permissions/issue-permissions-helper';
import {ON_NAVIGATE_BACK} from 'actions/action-types';
import {routeMap} from 'app-routes';

import type {Activity} from 'types/Activity';
import type {Article, ArticlesList} from 'types/Article';
import type {CustomError} from 'types/Error';
import type {IssueComment} from 'types/CustomFields';
import type {ProjectTeam} from 'types/Project';

export type ArticleState = {
  activityPage: Activity[] | null;
  article: Article | null;
  articleCommentDraft: IssueComment | null;
  articlesList: ArticlesList;
  error: CustomError | null;
  isLoading: boolean;
  isProcessing: boolean;
  issuePermissions: IssuePermissions;
  prevArticleState: ArticleState | null | undefined;
  lastVisitedArticle?: Partial<Article>;
  defaultTeam: ProjectTeam | null;
};

export const articleInitialState: ArticleState = {
  activityPage: null,
  article: null,
  articleCommentDraft: null,
  articlesList: [],
  error: null,
  isLoading: false,
  isProcessing: false,
  issuePermissions: issuePermissionsNull,
  prevArticleState: null,
  defaultTeam: null,
};

const {reducer, actions} = createSlice({
  name: 'article',
  initialState: articleInitialState,
  reducers: {
    setProcessing(state: ArticleState, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },

    setError(state: ArticleState, action: PayloadAction<CustomError>) {
      state.error = action.payload;
    },

    setArticle(state: ArticleState, action: PayloadAction<Article | null>) {
      state.article = action.payload;
    },

    setActivityPage(
      state: ArticleState,
      action: PayloadAction<Activity[]>,
    ) {
      state.activityPage = action.payload;
    },

    setPrevArticle(state: ArticleState, action: PayloadAction<ArticleState>) {
      state.prevArticleState = action.payload;
    },

    setArticleCommentDraft(
      state: ArticleState,
      action: PayloadAction<IssueComment>,
    ) {
      state.articleCommentDraft = action.payload;
    },

    setDefaultTeam(
      state: ArticleState,
      action: PayloadAction<ProjectTeam>,
    ) {
      state.defaultTeam = action.payload;
    },
  },

  extraReducers: {
    [ON_NAVIGATE_BACK]: (
      state: ArticleState,
      action: {
        closingView: {
          routeName: string;
          params: {
            articlePlaceholder: Article;
          };
        };
      },
    ): ArticleState => {
      if (action.closingView.routeName === routeMap.Article) {
        return state.prevArticleState
          ? state.prevArticleState
          : articleInitialState;
      }

      return state;
    },
  },
});

export const {
  setError,
  setArticle,
  setActivityPage,
  setProcessing,
  setPrevArticle,
  setArticleCommentDraft,
  setDefaultTeam,
} = actions;

export default reducer;
