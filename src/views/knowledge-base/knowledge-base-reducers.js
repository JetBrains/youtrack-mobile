/* @flow */

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type {Article, ArticlesList} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';
import type {CustomError} from '../../flow/Error';

export type KnowledgeBaseState = {
  articlesList: ArticlesList,
  isLoading: boolean,
  error: CustomError
};

const articlesInitialState: KnowledgeBaseState = {
  articlesList: [],
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
    setList(state: KnowledgeBaseState, action: PayloadAction<Array<{ title: IssueProject, data: Array<Article> }>>) {
      state.articlesList = action.payload;
    }
  }
});

export const {setLoading, setError, setList} = actions;
export default reducer;
