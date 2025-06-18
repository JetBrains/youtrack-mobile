import {createSlice} from '@reduxjs/toolkit';
import type {ArticlesList, ProjectArticlesData} from 'types/Article';
import type {AnyError} from 'types/Error';
export type KnowledgeBaseState = {
  articles: ProjectArticlesData[] | null;
  articlesList: ArticlesList | null;
  isLoading: boolean;
  expandingProjectId: string | null;
  error:
    | (AnyError & {
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
        payload: string | null;
      },
    ) {
      state.expandingProjectId = action.payload;
    },

    setError(
      state: KnowledgeBaseState,
      action: {
        payload: AnyError | null;
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
        payload: ProjectArticlesData[] | null;
      },
    ) {
      state.articles = action.payload;
    },
  },
});
export const {setError, setList, setArticles, setExpandingProjectId} = actions;
export default reducer;
