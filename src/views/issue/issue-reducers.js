/* @flow */

import {createReducer} from 'redux-create-reducer';
import * as types from './issue-action-types';
import {attachmentTypes} from './issue__attachment-actions-and-types';
import {ON_NAVIGATE_BACK} from '../../actions/action-types';
import {routeMap} from '../../app-routes';

import type {IssueFull, CommandSuggestionResponse, AnyIssue} from '../../flow/Issue';
import type {CustomField, FieldValue, IssueProject} from '../../flow/CustomFields';
import type {User} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';

export type State = {
  issueId: string,
  issue: IssueFull,
  unloadedIssueState: ?State,
  isRefreshing: boolean,
  issueLoaded: boolean,
  issueLoadingError: ?Error,
  editMode: boolean,
  isSavingEditedIssue: boolean,
  summaryCopy: string,
  descriptionCopy: string,
  suggestionsAreLoading: boolean,
  showCommandDialog: boolean,
  initialCommand: string,
  commandSuggestions: ?CommandSuggestionResponse,
  commandIsApplying: boolean,
  isVisibilitySelectShown: boolean,
  selectProps: ?Object,
  user: User,
  updateUserAppearanceProfile: Function,

  attachingImage: ?Object,
  isAttachFileDialogVisible: boolean
};

export const initialState: State = {
  unloadedIssueState: null,
  issueId: '',
  issue: null,
  isRefreshing: false,
  issueLoaded: false,
  issueLoadingError: null,
  editMode: false,
  isSavingEditedIssue: false,
  summaryCopy: '',
  descriptionCopy: '',
  suggestionsAreLoading: false,
  showCommandDialog: false,
  initialCommand: '',
  commandSuggestions: null,
  commandIsApplying: false,
  isVisibilitySelectShown: false,
  selectProps: null,
  user: null,
  updateUserAppearanceProfile: null,

  attachingImage: null,
  isAttachFileDialogVisible: false,
};

const attachReducers = {
  [attachmentTypes.ATTACH_START_ADDING](state: State, action: {attachingImage: Object}): State {
    const {attachingImage} = action;
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: [...state.issue.attachments, attachingImage],
      },
      attachingImage,
    };
  },
  [attachmentTypes.ATTACH_CANCEL_ADDING](state: State, action: {attachingImage: Object}): State {
    const {attachingImage} = action;
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: state.issue.attachments.filter(attachment => attachment !== attachingImage),
      },
      attachingImage: null,
    };
  },
  [attachmentTypes.ATTACH_REMOVE](state: State, action: {attachmentId: string}): State {
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: state.issue.attachments.filter(attach => attach.id !== action.attachmentId),
      },
    };
  },
  [attachmentTypes.ATTACH_STOP_ADDING](state: State): State {
    return {...state, attachingImage: null};
  },
  [attachmentTypes.ATTACH_TOGGLE_ADD_FILE_DIALOG](state: State, action: {isAttachFileDialogVisible: boolean}): State {
    return {
      ...state,
      isAttachFileDialogVisible: action.isAttachFileDialogVisible,
    };
  },
  [attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS](state: State, action: {attachments: boolean}): State {
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: action.attachments,
      },
    };
  },
};

export default (createReducer(initialState, {
  ...attachReducers,

  [ON_NAVIGATE_BACK]: (state: State, action: { closingView: { routeName: string, params: { issueId?: string } } }): State => {
    if (action.closingView.routeName === routeMap.Issue) {
      return state.unloadedIssueState ? state.unloadedIssueState : initialState;
    }
    return state;
  },
  [types.SET_ISSUE_ID]: (state: State, action: { issueId: string }): State => {
    return {...state, issueId: action.issueId};
  },
  [types.RESET_SINGLE_ISSUE]: (state: State, action: { issueId: string }): State => {
    return initialState;
  },
  [types.START_ISSUE_REFRESHING]: (state: State): State => {
    return {...state, isRefreshing: true};
  },
  [types.STOP_ISSUE_REFRESHING]: (state: State): State => {
    return {...state, isRefreshing: false};
  },
  [types.RECEIVE_ISSUE]: (state: State, action: { issue: IssueFull }): State => {
    return {
      ...state,
      issueLoaded: true,
      issueLoadingError: null,
      issue: {
        ...action.issue,
      },
    };
  },
  [types.RECEIVE_ISSUE_LINKS]: (state: State, action: { issueLinks: Array<AnyIssue> }): State => {
    return {
      ...state,
      issue: {
        ...state.issue,
        links: action.issueLinks,
      },
    };
  },
  [types.RECEIVE_ISSUE_VISIBILITY]: (state: State, action: { visibility: Visibility }): State => {
    return {
      ...state,
      issue: {
        ...state.issue,
        visibility: action.visibility,
      },
    };
  },
  [types.RECEIVE_ISSUE_ERROR]: (state: State, action: { error: Error }): State => {
    return {...state, issueLoadingError: action.error};
  },
  [types.START_EDITING_ISSUE]: (state: State): State => {
    return {
      ...state,
      summaryCopy: state.issue.summary,
      descriptionCopy: state.issue.description,
      editMode: true,
    };
  },
  [types.STOP_EDITING_ISSUE]: (state: State): State => {
    return {...state, editMode: false, summaryCopy: '', descriptionCopy: ''};
  },
  [types.SET_ISSUE_SUMMARY_AND_DESCRIPTION]: (state: State, action: { summary: string, description: string }): State => {
    return {
      ...state,
      issue: {
        ...state.issue,
        summary: action.summary,
        description: action.description,
      },
    };
  },
  [types.SET_ISSUE_SUMMARY_COPY]: (state: State, action: { summary: string }): State => {
    return {
      ...state,
      summaryCopy: action.summary,
    };
  },
  [types.SET_ISSUE_DESCRIPTION_COPY]: (state: State, action: { description: string }): State => {
    return {
      ...state,
      descriptionCopy: action.description,
    };
  },
  [types.START_SAVING_EDITED_ISSUE]: (state: State,): State => {
    return {...state, isSavingEditedIssue: true};
  },
  [types.STOP_SAVING_EDITED_ISSUE]: (state: State): State => {
    return {...state, isSavingEditedIssue: false};
  },
  [types.SET_ISSUE_FIELD_VALUE]: (state: State, action: { field: CustomField, value: FieldValue }): State => {
    const {field, value} = action;
    return {
      ...state,
      issue: {
        ...state.issue,
        fields: [...state.issue.fields].map(it => {
          return it === field ? {...it, value} : it;
        }),
      },
    };
  },
  [types.SET_PROJECT]: (state: State, action: { project: IssueProject }): State => {
    return {
      ...state,
      issue: {
        ...state.issue,
        project: action.project,
      },
    };
  },
  [types.SET_VOTED]: (state: State, action: { voted: boolean }): State => {
    const {issue} = state;
    const {voted} = action;
    const votes: number = (issue?.votes || 0) + (voted ? 1 : -1);
    if (votes >= 0 ) {
      return {
        ...state,
        issue: {
          ...issue,
          votes,
          voters: {
            ...state.issue.voters,
            hasVote: voted,
          },
        },
      };
    } else {
      return state;
    }
  },
  [types.SET_STARRED]: (state: State, action: { starred: boolean }): State => {
    const {issue} = state;
    const {starred} = action;
    return {
      ...state,
      issue: {
        ...issue,
        watchers: {
          ...issue?.watchers,
          hasStar: starred,
        },
      },
    };
  },
  [types.UNLOAD_ACTIVE_ISSUE_VIEW]: (state: State): State => {
    return {...initialState, unloadedIssueState: state};
  },
  [types.OPEN_COMMAND_DIALOG]: (state: State, action: { initialCommand: string }): State => {
    return {...state, showCommandDialog: true, initialCommand: action.initialCommand};
  },
  [types.CLOSE_COMMAND_DIALOG]: (state: State): State => {
    return {...state, showCommandDialog: false, commandSuggestions: null, initialCommand: ''};
  },
  [types.RECEIVE_COMMAND_SUGGESTIONS]: (state: State, action: { suggestions: Object }): State => {
    return {...state, commandSuggestions: action.suggestions};
  },
  [types.START_APPLYING_COMMAND]: (state: State): State => {
    return {...state, commandIsApplying: true};
  },
  [types.STOP_APPLYING_COMMAND]: (state: State): State => {
    return {...state, commandIsApplying: false};
  },
  [types.RECEIVE_VISIBILITY_OPTIONS]: (state: State, action: { options: Object }): State => {
    return {...state, visibilityOptions: action.options};
  },
  [types.OPEN_ISSUE_SELECT]: (state: State, action: Object) => {
    return {
      ...state,
      ...action,
    };
  },
  [types.CLOSE_ISSUE_SELECT]: (state: State, action: Object) => {
    return {
      ...state,
      ...action,
    };
  },
}): any);
