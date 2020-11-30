/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type {Article, ArticleTree} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';
import type {CustomError} from '../../flow/Error';

export type ArticlesState = {
  articlesTree: ArticleTree,
  isLoading: boolean,
  error: CustomError
};

const articlesInitialState: ArticlesState = {
  articlesTree: [],
  isLoading: false,
  error: null
};


const {reducer, actions} = createSlice({
  name: 'articles',
  initialState: articlesInitialState,
  reducers: {
    setLoading(state: ArticlesState, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state: ArticlesState, action: PayloadAction<boolean>) {
      state.error = action.payload;
    },
    setTree(state: ArticlesState, action: PayloadAction<Array<{ title: IssueProject, data: Array<Article> }>>) {
      state.articlesTree = action.payload;
    }
  }
});

export const {setLoading, setError, setTree} = actions;
export default reducer;
