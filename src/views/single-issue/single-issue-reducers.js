/* @flow */

import {createReducer} from 'redux-create-reducer';
import * as types from './single-issue-action-types';
import {ON_NAVIGATE_BACK} from '../../actions/action-types';

import type {IssueFull, CommandSuggestionResponse} from '../../flow/Issue';
import type {CustomField, FieldValue, IssueProject} from '../../flow/CustomFields';
import type {User} from '../../flow/User';

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
  isSelectOpen: boolean,
  selectProps: Object,
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
  isSelectOpen: false,
  selectProps: {},
  user: null,
  updateUserAppearanceProfile: null,

  attachingImage: null,
  isAttachFileDialogVisible: false
};

export default createReducer(initialState, {
  [types.START_IMAGE_ATTACHING](state: State, action: {attachingImage: Object}): State {
    const {attachingImage} = action;
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: [...state.issue.attachments, attachingImage],
      },
      attachingImage
    };
  },
  [types.REMOVE_ATTACH](state: State, action: {attachmentId: string}): State {
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: state.issue.attachments.filter(attach => attach.id !== action.attachmentId),
      }
    };
  },
  [types.STOP_IMAGE_ATTACHING](state: State): State {
    return {...state, attachingImage: null};
  },
  [types.TOGGLE_ATTACH_FILE_DIALOG](state: State, action: {isAttachFileDialogVisible: boolean}): State {
    return {
      ...state,
      isAttachFileDialogVisible: action.isAttachFileDialogVisible
    };
  },
  [types.RECEIVE_ISSUE_ATTACHMENTS](state: State, action: {attachments: boolean}): State {
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: action.attachments,
      }
    };
  },

  ...{
    [ON_NAVIGATE_BACK]: (state: State, action: {closingView: {routeName: string, params: {issueId?: string}}}): State => {
      const isIssueView = action.closingView.routeName === 'SingleIssue';

      const previousIssueState = state.unloadedIssueState ? state.unloadedIssueState : initialState;

      return isIssueView ? previousIssueState : state;
    },
    [types.SET_ISSUE_ID]: (state: State, action: {issueId: string}): State => {
      return {...state, issueId: action.issueId};
    },
    [types.RESET_SINGLE_ISSUE]: (state: State, action: {issueId: string}): State => {
      return initialState;
    },
    [types.START_ISSUE_REFRESHING]: (state: State): State => {
      return {...state, isRefreshing: true};
    },
    [types.STOP_ISSUE_REFRESHING]: (state: State): State => {
      return {...state, isRefreshing: false};
    },
    [types.RECEIVE_ISSUE]: (state: State, action: {issue: IssueFull}): State => {
      return {
        ...state,
        issueLoaded: true,
        issueLoadingError: null,
        issue: {
          ...action.issue,
        }
      };
    },
    [types.RECEIVE_ISSUE_ERROR]: (state: State, action: {error: Error}): State => {
      return {...state, issueLoadingError: action.error};
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
        descriptionCopy: action.description
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
    [types.SET_PROJECT]: (state: State, action: {project: IssueProject}): State => {
      return {
        ...state,
        issue: {
          ...state.issue,
          project: action.project
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
    [types.UNLOAD_ACTIVE_ISSUE_VIEW]: (state: State, action: {starred: boolean}): State => {
      return {...initialState, unloadedIssueState: state};
    },
    [types.OPEN_COMMAND_DIALOG]: (state: State, action: {initialCommand: string}): State => {
      return {...state, showCommandDialog: true, initialCommand: action.initialCommand};
    },
    [types.CLOSE_COMMAND_DIALOG]: (state: State): State => {
      return {...state, showCommandDialog: false, commandSuggestions: null, initialCommand: ''};
    },
    [types.RECEIVE_COMMAND_SUGGESTIONS]: (state: State, action: {suggestions: Object}): State => {
      return {...state, commandSuggestions: action.suggestions};
    },
    [types.START_APPLYING_COMMAND]: (state: State): State => {
      return {...state, commandIsApplying: true};
    },
    [types.STOP_APPLYING_COMMAND]: (state: State): State => {
      return {...state, commandIsApplying: false};
    },
    [types.RECEIVE_VISIBILITY_OPTIONS]: (state: State, action: {options: Object}): State => {
      return {...state, visibilityOptions: action.options};
    },
    [types.OPEN_ISSUE_SELECT]: (state: State, action: Object) => {
      return {
        ...state,
        isSelectOpen: true,
        selectProps: action.selectProps
      };
    },
    [types.CLOSE_ISSUE_SELECT]: (state: State) => {
      return {
        ...state,
        isSelectOpen: false,
        selectProps: null
      };
    }
  }
});
