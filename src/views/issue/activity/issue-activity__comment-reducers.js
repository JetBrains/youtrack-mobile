/* @flow */

import {createReducer} from 'redux-create-reducer';
import * as types from '../issue-action-types';
import type {IssueComment} from '../../../flow/CustomFields';

export type State = {
  commentsLoadingError: ?Error,
  commentSuggestions: ?Object,
  commentText: string,
  editingComment: ?IssueComment,
  isVisibilitySelectShown: boolean,
  submittingComment: boolean,
  suggestionsAreLoading: boolean,
  tmpIssueComments: ?Array<IssueComment>,
  updateUserAppearanceProfile: Function
};

export const initialState: State = {
  commentsLoadingError: null,
  commentSuggestions: null,
  commentText: '',
  editingComment: null,
  isVisibilitySelectShown: false,
  submittingComment: false,
  suggestionsAreLoading: false,
  tmpIssueComments: null,
  updateUserAppearanceProfile: null
};

export default createReducer(initialState, {
  [types.RECEIVE_COMMENTS_ERROR]: (state: State, action: {error: Error}): State => {
    return {...state, commentsLoadingError: action.error};
  },
  [types.START_SUBMITTING_COMMENT]: (state: State, action: {comment: string}): State => {
    return {...state, submittingComment: true, commentText: action.comment};
  },
  [types.STOP_SUBMITTING_COMMENT]: (state: State): State => {
    return {...state, submittingComment: false};
  },
  [types.SET_COMMENT_TEXT]: (state: State, action: {comment: string}): State => {
    return {...state, commentText: action.comment};
  },
  [types.SET_EDITING_COMMENT]: (state: State, action: {comment: IssueComment}): State => {
    return {...state, editingComment: action.comment};
  },
  [types.CLEAR_EDITING_COMMENT]: (state: State): State => {
    return {...state, editingComment: null};
  },
  [types.SET_COMMENT_TEXT]: (state: State, action: {comment: string}): State => {
    return {...state, commentText: action.comment};
  },
  [types.START_LOADING_COMMENT_SUGGESTIONS]: (state: State): State => {
    return {...state, suggestionsAreLoading: true};
  },
  [types.STOP_LOADING_COMMENT_SUGGESTIONS]: (state: State): State => {
    return {...state, suggestionsAreLoading: false};
  },
  [types.RECEIVE_COMMENT_SUGGESTIONS]: (state: State, action: {suggestions: Object}): State => {
    return {...state, commentSuggestions: action.suggestions};
  },
  [types.RECEIVE_VISIBILITY_OPTIONS]: (state: State, action: {options: Object}): State => {
    return {...state, visibilityOptions: action.options};
  },
  [types.OPEN_ISSUE_SELECT]: (state: State, action: Object) => {
    return {
      ...state,
      isVisibilitySelectShown: true,
      selectProps: action.selectProps
    };
  },
  [types.CLOSE_ISSUE_SELECT]: (state: State) => {
    return {
      ...state,
      isVisibilitySelectShown: false,
      selectProps: null
    };
  },
  [types.SET_COMMENT_VISIBILITY]: (state: State, action: Object) => {
    return {...state, editingComment: action.comment};
  },
});
