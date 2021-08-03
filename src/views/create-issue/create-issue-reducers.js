/* @flow */

import {createSlice, Slice} from '@reduxjs/toolkit';

import {attachmentTypes} from './create-issue__attachment-actions-and-types';
import {LOG_OUT} from '../../actions/action-types';

import type {Attachment, CustomField, FieldValue, IssueProject} from '../../flow/CustomFields';
import type {IssueFull} from '../../flow/Issue';

export type CreateIssueState = {
  processing: boolean,
  attachingImage: ?Object,
  predefinedDraftId: ?string,
  issue: $Shape<IssueFull>,
  isAttachFileDialogVisible: boolean
};


const notSelectedProject: $Shape<IssueProject> = {
  id: '',
  name: 'Not selected',
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
    project: notSelectedProject,
  },
  isAttachFileDialogVisible: false,
};

export const createIssueReducersNamespace = 'IssueCreate';

const slice: typeof Slice = createSlice({
  name: createIssueReducersNamespace,
  initialState,

  extraReducers: {
    ...createAttachmentReducers(),
    [LOG_OUT](state: CreateIssueState): CreateIssueState {
      return initialState;
    },
  },

  reducers: {
    setIssuePredefinedDraftId: (state: CreateIssueState, action: { payload: { preDefinedDraftId: string } }) => {
      state.predefinedDraftId = action.payload.preDefinedDraftId;
    },
    setIssueDraft: (state: CreateIssueState, action: { payload: { issue: IssueFull } }) => {
      state.issue = {...state.issue, ...action.payload.issue};
    },
    resetIssueDraftId: (state: CreateIssueState) => {
      state.issue = {
        ...state.issue,
        id: '',
      };
    },
    setIssueProject: (state: CreateIssueState, action: { payload: { project: IssueProject } }) => {
      state.issue = {
        ...state.issue,
        project: action.payload.project,
      };
    },
    setDraftProjectId: (state: CreateIssueState, action: { payload: { projectId: string } }) => {
      state.issue = {
        ...state.issue,
        project: {
          ...state.issue.project,
          id: action.payload.projectId,
        },
      };
    },
    clearDraftProject: (state: CreateIssueState) => {
      state.issue = {
        ...state.issue,
        project: notSelectedProject,
      };
    },
    setIssueSummary: (state: CreateIssueState, action: { payload: { summary: string } }) => {
      state.issue = {
        ...state.issue,
        summary: action.payload.summary,
      };
    },
    setIssueDescription: (state: CreateIssueState, action: { payload: { description: string } }) => {
      state.issue = {
        ...state.issue,
        description: action.payload.description,
      };
    },
    startIssueCreation: (state: CreateIssueState) => { state.processing = true; },
    stopIssueCreation: (state: CreateIssueState) => {state.processing = false;},
    resetCreation: (state: CreateIssueState) => initialState,
    setIssueFieldValue: (
      state: CreateIssueState,
      action: { payload: { field: CustomField, value: FieldValue } }
    ) => {
      state.issue = {
        ...state.issue,
        fields: [...state.issue.fields].map(
          (it: CustomField) => it === action.payload.field ? {...it, value: action.payload.value} : it
        ),
      };
    },
  },
});



export const actions = slice.actions;
export default slice.reducer;


function createAttachmentReducers() {
  return {
    [attachmentTypes.ATTACH_START_ADDING](
      state: CreateIssueState,
      action: { attachingImage: Object }
    ): CreateIssueState {
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
    [attachmentTypes.ATTACH_CANCEL_ADDING](
      state: CreateIssueState,
      action: { attachingImage: Object }
    ): CreateIssueState {
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
    [attachmentTypes.ATTACH_REMOVE](state: CreateIssueState, action: { attachmentId: string }): CreateIssueState {
      return {
        ...state,
        issue: {
          ...state.issue,
          attachments: state.issue.attachments.filter(attach => attach.id !== action.attachmentId),
        },
      };
    },
    [attachmentTypes.ATTACH_STOP_ADDING](state: CreateIssueState): CreateIssueState {
      return {...state, attachingImage: null};
    },
    [attachmentTypes.ATTACH_TOGGLE_ADD_FILE_DIALOG](
      state: CreateIssueState,
      action: { isAttachFileDialogVisible: boolean }
    ): CreateIssueState {
      return {
        ...state,
        isAttachFileDialogVisible: action.isAttachFileDialogVisible,
      };
    },
    [attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS](
      state: CreateIssueState,
      action: { attachments: Array<Attachment> }
    ): CreateIssueState {
      return {
        ...state,
        issue: {
          ...state.issue,
          attachments: action.attachments,
        },
      };
    },
  };
}
