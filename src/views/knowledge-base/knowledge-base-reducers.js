/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type {Article, ArticleTree} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';
import type {CustomError} from '../../flow/Error';

export type KnowledgeBaseState = {
  articlesTree: ArticleTree,
  isLoading: boolean,
  error: CustomError
};

const articlesInitialState: KnowledgeBaseState = {
  articlesTree: [],
  isLoading: false,
  error: null
};


const {reducer, actions} = createSlice({
  name: 'knowledgeBase',
  initialState: articlesInitialState,
  reducers: {
    setLoading(state: KnowledgeBaseState, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state: KnowledgeBaseState, action: PayloadAction<boolean>) {
      state.error = action.payload;
    },
    setTree(state: KnowledgeBaseState, action: PayloadAction<Array<{ title: IssueProject, data: Array<Article> }>>) {
      state.articlesTree = action.payload;
    }
  }
});

export const {setLoading, setError, setTree} = actions;
export default reducer;
