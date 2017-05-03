/* @flow */
import {createReducer} from 'redux-create-reducer';
import * as types from './single-issue-action-types';
import type {IssueFull} from '../../flow/Issue';
import type {CustomField, FieldValue} from '../../flow/CustomFields';


export type State = {
  issueId: string,
  issue: IssueFull,
  unloadedIssues: Array<IssueFull>,
  isLoading: boolean,
  fullyLoaded: boolean,
  editMode: boolean,
  isSavingEditedIssue: boolean,
  attachingImage: ?Object,
  addCommentMode: boolean,
  isAddingComment: boolean,
  commentText: string,
  summaryCopy: string,
  descriptionCopy: string
};

const initialState: State = {
  unloadedIssues: [],
  issueId: '',
  issue: null,
  isLoading: false,
  fullyLoaded: false,
  editMode: false,
  isSavingEditedIssue: false,
  attachingImage: null,
  addCommentMode: false,
  isAddingComment: false,
  commentText: '',
  summaryCopy: '',
  descriptionCopy: ''
};

export default createReducer(initialState, {
  [types.SET_ISSUE_ID]: (state: State, action: {issueId: string}): State => {
    return {...state, issueId: action.issueId};
  },
  [types.START_ISSUE_LOADING]: (state: State): State => {
    return {...state, isLoading: true};
  },
  [types.STOP_ISSUE_LOADING]: (state: State): State => {
    return {...state, isLoading: false};
  },
  [types.RECEIVE_ISSUE]: (state: State, action: {issue: IssueFull}): State => {
    return {...state, fullyLoaded: true, issue: action.issue};
  },
  [types.SHOW_COMMENT_INPUT]: (state: State): State => {
    return {...state, addCommentMode: true};
  },
  [types.HIDE_COMMENT_INPUT]: (state: State): State => {
    return {...state, addCommentMode: false};
  },
  [types.START_ADDING_COMMENT]: (state: State, action: {comment: string}): State => {
    return {...state, isAddingComment: true, commentText: action.comment};
  },
  [types.STOP_ADDING_COMMENT]: (state: State): State => {
    return {...state, isAddingComment: true};
  },
  [types.SET_COMMENT_TEXT]: (state: State, action: {comment: string}): State => {
    return {...state, commentText: action.comment};
  },
  [types.RECEIVE_COMMENT]: (state: State, action: {comment: Object}): State => {
    return {
      ...state,
      issue: {
        ...state.issue,
        comments: [
          ...state.issue.comments,
          action.comment
        ]
      }
    };
  },
  [types.START_EDITING_ISSUE]: (state: State): State => {
    return {
      ...state,
      summaryCopy: state.issue.summary,
      descriptionCopy: state.issue.description,
      editMode: true
    };
  },
  [types.STOP_EDITING_ISSUE]: (state: State): State => {
    return {...state, editMode: false, summaryCopy: '', descriptionCopy: ''};
  },
  [types.SET_ISSUE_SUMMARY_AND_DESCRIPTION]: (state: State, action: {summary: string, description: string}): State => {
    return {
      ...state,
      issue: {
        ...state.issue,
        summary: action.summary,
        description: action.description
      }
    };
  },
  [types.SET_ISSUE_SUMMARY_COPY]: (state: State, action: {summary: string}): State => {
    return {
      ...state,
      summaryCopy: action.summary
    };
  },
  [types.SET_ISSUE_DESCRIPTION_COPY]: (state: State, action: {description: string}): State => {
    return {
      ...state,
      description: action.description
    };
  },
  [types.START_SAVING_EDITED_ISSUE]: (state: State,): State => {
    return {...state, isSavingEditedIssue: true};
  },
  [types.STOP_SAVING_EDITED_ISSUE]: (state: State): State => {
    return {...state, isSavingEditedIssue: false};
  },
  [types.SET_ISSUE_FIELD_VALUE]: (state: State, action: {field: CustomField, value: FieldValue}): State => {
    const {field, value} = action;
    return {
      ...state,
      issue: {
          ...state.issue,
          fields: [...state.issue.fields].map(it => {
            return it === field ? {...it, value} : it;
          })
        }
    };
  },
  [types.SET_VOTED]: (state: State, action: {voted: boolean}): State => {
    const {issue} = state;
    const {voted} = action;
    return {
      ...state,
      issue: {
        ...issue,
        votes: voted ? issue.votes + 1 : issue.votes - 1,
        voters: {
          ...state.issue.voters,
          hasVote: voted
        }
      }
    };
  },
  [types.SET_STARRED]: (state: State, action: {starred: boolean}): State => {
    const {issue} = state;
    const {starred} = action;
    return {
      ...state,
      issue: {
        ...issue,
        watchers: {
          ...issue.watchers,
          hasStar: starred
        }
      }
    };
  },
});
