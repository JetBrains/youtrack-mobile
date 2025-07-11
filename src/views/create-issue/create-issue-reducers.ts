import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {attachmentTypes} from './create-issue__attachment-actions-and-types';
import {createCommandDialogReducers} from 'components/command-dialog/command-dialog-reducer';
import {createIssueNamespace} from './create-issue-action-types';
import {LOG_OUT} from 'actions/action-types';

import {Attachment, CustomField, CustomFieldBaseValue, IssueLink} from 'types/CustomFields';
import type {CommandSuggestionResponse, IssueCreate} from 'types/Issue';
import type {Project} from 'types/Project';

export type CreateIssueState = {
  drafts: IssueCreate[];
  processing: boolean;
  attachingImage: Attachment | null;
  predefinedDraftId: string | null;
  issue: IssueCreate;
  isAttachFileDialogVisible: boolean;
  commandIsApplying: boolean;
  commandSuggestions?: CommandSuggestionResponse | null;
  showCommandDialog: boolean;
};

const notSelectedProject: Partial<Project> = {
  id: '',
  name: 'Not selected',
};

const initialState: CreateIssueState = {
  drafts: [],
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
  } as unknown as IssueCreate,
  isAttachFileDialogVisible: false,
  commandIsApplying: false,
  commandSuggestions: null,
  showCommandDialog: false,
};

const slice = createSlice({
  name: createIssueNamespace,
  initialState,
  extraReducers: {
    ...createAttachmentReducers(),
    ...createCommandDialogReducers(createIssueNamespace),

    [LOG_OUT](state: CreateIssueState): CreateIssueState {
      return initialState;
    },
  },
  reducers: {
    setIssuePredefinedDraftId: (state: CreateIssueState, action: PayloadAction<{preDefinedDraftId: string}>) => {
      state.predefinedDraftId = action.payload.preDefinedDraftId;
    },
    setIssueDraft: (state: CreateIssueState, action: PayloadAction<{issue: IssueCreate | Partial<IssueCreate>}>) => {
      state.issue = {...state.issue, ...action.payload.issue};
    },
    resetIssueDraftId: (state: CreateIssueState) => {
      state.issue = {...state.issue, id: ''};
    },
    setUserDrafts: (
      state: CreateIssueState,
      action: PayloadAction<{drafts: IssueCreate[];}>
    ) => {
      state.drafts = action.payload.drafts;
    },
    setIssueProject: (
      state: CreateIssueState,
      action: PayloadAction<{project: Project;}>
    ) => {
      state.issue = {...state.issue, project: action.payload.project};
    },
    setDraftProjectId: (
      state: CreateIssueState,
      action: PayloadAction<{projectId: string;}>
    ) => {
      state.issue = {
        ...state.issue,
        project: {...state.issue.project, id: action.payload.projectId},
      };
    },
    clearDraftProject: (state: CreateIssueState) => {
      state.issue = {...state.issue, project: notSelectedProject};
    },
    setIssueSummary: (
      state: CreateIssueState,
      action: PayloadAction<{summary: string;}>
    ) => {
      state.issue = {...state.issue, summary: action.payload.summary};
    },
    setIssueDescription: (state: CreateIssueState, action: PayloadAction<{description: string}>) => {
      state.issue = {...state.issue, description: action.payload.description};
    },
    startIssueCreation: (state: CreateIssueState) => {
      state.processing = true;
    },
    stopIssueCreation: (state: CreateIssueState) => {
      state.processing = false;
    },
    resetCreation: () => initialState,
    setIssueFieldValue: (
      state: CreateIssueState,
      action: PayloadAction<{field: CustomField; value: CustomFieldBaseValue;}>
    ) => {
      state.issue = {
        ...state.issue,
        fields: [...state.issue.fields].map(f =>
          f === action.payload.field ? {...f, value: action.payload.value} : f
        ),
      };
    },
    setIssueLinks: (
      state: CreateIssueState,
      action: PayloadAction<{links: IssueLink[];}>
    ) => {
      state.issue = {...state.issue, links: action.payload.links};
    },
  },
});
export const actions = slice.actions;
export default slice.reducer;

function createAttachmentReducers() {
  return {
    [attachmentTypes.ATTACH_START_ADDING](
      state: CreateIssueState,
      action: {
        attachingImage: Attachment;
      }
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
      action: {
        attachingImage: Record<string, any>;
      }
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

    [attachmentTypes.ATTACH_REMOVE](
      state: CreateIssueState,
      action: {
        attachmentId: string;
      }
    ): CreateIssueState {
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
      action: {
        isAttachFileDialogVisible: boolean;
      }
    ): CreateIssueState {
      return {
        ...state,
        isAttachFileDialogVisible: action.isAttachFileDialogVisible,
      };
    },

    [attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS](
      state: CreateIssueState,
      action: {
        attachments: Attachment[];
      }
    ): CreateIssueState {
      return {
        ...state,
        issue: {...state.issue, attachments: action.attachments},
      };
    },
  };
}
