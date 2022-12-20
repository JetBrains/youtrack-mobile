import {createSlice, Slice} from '@reduxjs/toolkit';
import type {ArticlesList, ProjectArticlesData} from 'types/Article';
import type {CustomError} from 'types/Error';
export type KnowledgeBaseState = {
  articles: Array<ProjectArticlesData> | null;
  articlesList: ArticlesList | null;
  isLoading: boolean;
  expandingProjectId: string | null;
  error:
    | (CustomError & {
        noFavoriteProjects?: boolean;
      })
    | null;
};
const articlesInitialState: KnowledgeBaseState = {
  articles: null,
  articlesList: null,
  isLoading: false,
  expandingProjectId: null,
  error: null,
};
const {reducer, actions} = createSlice({
  name: 'knowledgeBase',
  initialState: articlesInitialState,
  reducers: {
    setExpandingProjectId(
      state: KnowledgeBaseState,
      action: {
        payload: string;
      },
    ) {
      state.expandingProjectId = action.payload;
    },

    setError(
      state: KnowledgeBaseState,
      action: {
        payload: CustomError | null;
      },
    ) {
      state.error = action.payload;
    },

    setList(
      state: KnowledgeBaseState,
      action: {
        payload: ArticlesList | null;
      },
    ) {
      state.articlesList = action.payload;
    },

    setArticles(
      state: KnowledgeBaseState,
      action: {
        payload: Array<ProjectArticlesData>;
      },
    ) {
      state.articles = action.payload;
    },
  },
}) as typeof Slice;
export const {setError, setList, setArticles, setExpandingProjectId} = actions;
export default reducer;
