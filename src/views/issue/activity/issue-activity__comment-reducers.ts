import {createReducer} from 'redux-create-reducer';
import * as types from '../issue-action-types';
import type {IssueComment} from 'types/CustomFields';
export type State = {
  commentsLoadingError: Error | null | undefined;
  commentSuggestions: Record<string, any> | null | undefined;
  commentText: string;
  editingComment: IssueComment | null | undefined;
  isVisibilitySelectShown: boolean;
  suggestionsAreLoading: boolean;
  tmpIssueComments: IssueComment[] | null | undefined;
  updateUserAppearanceProfile: (...args: any[]) => any;
};
export const initialState: State = {
  commentsLoadingError: null,
  commentSuggestions: null,
  commentText: '',
  editingComment: null,
  isVisibilitySelectShown: false,
  suggestionsAreLoading: false,
  tmpIssueComments: null,
  updateUserAppearanceProfile: null,
};
export default createReducer(initialState, {
  [types.RECEIVE_COMMENTS_ERROR]: (
    state: State,
    action: {
      error: Error;
    },
  ): State => {
    return {...state, commentsLoadingError: action.error};
  },
  [types.SET_EDITING_COMMENT]: (
    state: State,
    action: {
      comment: IssueComment;
    },
  ): State => {
    return {...state, editingComment: action.comment};
  },
  [types.START_LOADING_COMMENT_SUGGESTIONS]: (state: State): State => {
    return {...state, suggestionsAreLoading: true};
  },
  [types.STOP_LOADING_COMMENT_SUGGESTIONS]: (state: State): State => {
    return {...state, suggestionsAreLoading: false};
  },
  [types.RECEIVE_COMMENT_SUGGESTIONS]: (
    state: State,
    action: {
      suggestions: Record<string, any>;
    },
  ): State => {
    return {...state, commentSuggestions: action.suggestions};
  },
  [types.OPEN_ISSUE_SELECT]: (state: State, action: Record<string, any>) => {
    return {
      ...state,
      isVisibilitySelectShown: true,
      selectProps: action.selectProps,
    };
  },
  [types.CLOSE_ISSUE_SELECT]: (state: State) => {
    return {...state, isVisibilitySelectShown: false, selectProps: null};
  },
}) as any;
