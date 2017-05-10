/* @flow */
import {createReducer} from 'redux-create-reducer';
import * as types from './create-issue-action-types';
import {LOG_OUT} from '../../actions/action-types';
import type {CustomField, FieldValue} from '../../flow/CustomFields';
import type {IssueFull} from '../../flow/Issue';

const notSelectedProject = {
  id: null,
  shortName: 'Not selected'
};

export type CreateIssueState = {
  processing: boolean,
  attachingImage: ?Object,
  predefinedDraftId: ?string,
  issue: {
    summary: string,
    description: string,
    attachments: Array<Object>,
    fields: Array<CustomField>,
    project: Object
  }
};

const initialState: CreateIssueState = {
  processing: false,
  attachingImage: null,
  predefinedDraftId: null,

  issue: {
    summary: '',
    description: '',
    attachments: [],
    fields: [],
    project: notSelectedProject
  }
};

export default createReducer(initialState, {
  [LOG_OUT](state: CreateIssueState, action: {draftId: string}): CreateIssueState {
    return initialState;
  },
  [types.SET_ISSUE_PREDEFINED_DRAFT_ID](state: CreateIssueState, action: {draftId: string}): CreateIssueState {
    return {...state, predefinedDraftId: action.draftId};
  },
  [types.SET_ISSUE_DRAFT](state: CreateIssueState, action: {issue: IssueFull}): CreateIssueState {
    return {...state, issue: action.issue};
  },
  [types.RESET_ISSUE_DRAFT](state: CreateIssueState): CreateIssueState {
    return {
      ...state,
      issue: {
        ...state.issue,
        id: null
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
  [types.START_IMAGE_ATTACHING](state: CreateIssueState, action: {attachingImage: Object}): CreateIssueState {
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
  [types.REMOVE_ATTACHING_IMAGE](state: CreateIssueState): CreateIssueState {
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: state.issue.attachments.filter(attach => attach !== state.attachingImage),
      },
      attachingImage: null
    };
  },
  [types.STOP_IMAGE_ATTACHING](state: CreateIssueState): CreateIssueState {
    return {...state, attachingImage: null};
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
