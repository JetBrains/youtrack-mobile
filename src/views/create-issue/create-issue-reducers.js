/* @flow */

import {createReducer} from 'redux-create-reducer';

import {LOG_OUT} from '../../actions/action-types';
import * as types from './create-issue-action-types';
import {attachmentTypes} from './create-issue__attachment-actions-and-types';

import type {CustomField, FieldValue} from '../../flow/CustomFields';
import type {IssueFull} from '../../flow/Issue';
import type {State} from '../single-issue/single-issue-reducers';

const notSelectedProject = {
  id: null,
  name: 'Not selected'
};

export type CreateIssueState = {
  processing: boolean,
  attachingImage: ?Object,
  predefinedDraftId: ?string,
  issue: {
    id: string,
    summary: string,
    description: string,
    attachments: Array<Object>,
    fields: Array<CustomField>,
    project: Object
  },
  isAttachFileDialogVisible: boolean
};

const initialState: CreateIssueState = {
  processing: false,
  attachingImage: null,
  predefinedDraftId: null,
  issue: {
    id: '',
    summary: '',
    description: '',
    attachments: [],
    fields: [],
    project: notSelectedProject
  },
  isAttachFileDialogVisible: false
};

const attachReducers = {
  //$FlowFixMe
  [attachmentTypes.ATTACH_START_ADDING](state: CreateIssueState, action: {attachingImage: Object}): CreateIssueState {
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
  //$FlowFixMe
  [attachmentTypes.ATTACH_CANCEL_ADDING](state: CreateIssueState, action: {attachingImage: Object}): CreateIssueState {
    const {attachingImage} = action;
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: state.issue.attachments.filter(attachment => attachment !== attachingImage),
      },
      attachingImage: null
    };
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_REMOVE](state: CreateIssueState, action: {attachmentId: string}): State {
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: state.issue.attachments.filter(attach => attach.id !== action.attachmentId),
      }
    };
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_STOP_ADDING](state: CreateIssueState): CreateIssueState {
    return {...state, attachingImage: null};
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_TOGGLE_ADD_FILE_DIALOG](state: CreateIssueState, action: {isAttachFileDialogVisible: boolean}): State {
    return {
      ...state,
      isAttachFileDialogVisible: action.isAttachFileDialogVisible
    };
  },
  //$FlowFixMe
  [attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS](state: CreateIssueState, action: {attachments: boolean}): State {
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: action.attachments,
      }
    };
  }
};

export default createReducer(initialState, {
  ...attachReducers,

  [LOG_OUT](state: CreateIssueState, action: {draftId: string}): CreateIssueState {
    return initialState;
  },
  [types.SET_ISSUE_PREDEFINED_DRAFT_ID](state: CreateIssueState, action: {draftId: string}): CreateIssueState {
    return {...state, predefinedDraftId: action.draftId};
  },
  [types.SET_ISSUE_DRAFT](state: CreateIssueState, action: {issue: IssueFull}): CreateIssueState {
    return {...state, issue: {...state.issue, ...action.issue}};
  },
  [types.RESET_ISSUE_DRAFT](state: CreateIssueState): CreateIssueState {
    return {
      ...state,
      issue: {
        ...state.issue,
        id: ''
      }
    };
  },
  [types.SET_ISSUE_PROJECT](state: CreateIssueState, action: {project: Object}): CreateIssueState {
    const {project} = action;
    return {...state, issue: {...state.issue, project}};
  },
  [types.SET_DRAFT_PROJECT_ID](state: CreateIssueState, action: {projectId: string}): CreateIssueState {
    return {
      ...state,
      issue: {
        ...state.issue,
        project: {
          ...state.issue.project,
          id: action.projectId
        }
      }
    };
  },
  [types.CLEAR_DRAFT_PROJECT](state: CreateIssueState): CreateIssueState {
    return {
      ...state,
      issue: {
        ...state.issue,
        project: notSelectedProject
      }
    };
  },
  [types.SET_ISSUE_SUMMARY](state: CreateIssueState, action: {summary: string}): CreateIssueState {
    const {summary} = action;
    return {...state, issue: {...state.issue, summary}};
  },
  [types.SET_ISSUE_DESCRIPTION](state: CreateIssueState, action: {description: string}): CreateIssueState {
    const {description} = action;
    return {...state, issue: {...state.issue, description}};
  },
  [types.START_ISSUE_CREATION](state: CreateIssueState): CreateIssueState {
    return {...state, processing: true};
  },
  [types.STOP_ISSUE_CREATION](state: CreateIssueState): CreateIssueState {
    return {...state, processing: false};
  },
  [types.ISSUE_CREATED](state: CreateIssueState): CreateIssueState {
    return initialState;
  },
  [types.RESET_CREATION](state: CreateIssueState): CreateIssueState {
    return initialState;
  },
  [types.SET_ISSUE_FIELD_VALUE](state: CreateIssueState, action: {field: CustomField, value: FieldValue}): CreateIssueState {
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
  }
});
