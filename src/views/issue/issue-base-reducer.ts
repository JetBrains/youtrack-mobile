import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {attachmentActionMap} from 'components/attachments-row/attachment-helper';
import type {CommandSuggestionResponse, IssueFull, IssueSprint} from 'types/Issue';
import type {
  CustomField,
  FieldValue,
  IssueLink,

} from 'types/CustomFields';
import type {Project} from 'types/Project';
import type {SliceCaseReducers} from '@reduxjs/toolkit';
import type {User, UserCC} from 'types/User';
import type {Visibility} from 'types/Visibility';
import {IItem, ISelectProps} from 'components/select/select';
import {CustomError} from 'types/Error';

export type IssueState = {
  attachingImage: Record<string, any> | null | undefined;
  commandIsApplying: boolean;
  commandSuggestions: CommandSuggestionResponse | null | undefined;
  commentsCounter: number;
  descriptionCopy: string;
  editMode: boolean;
  initialCommand: string;
  isAttachFileDialogVisible: boolean;
  isRefreshing: boolean;
  isSavingEditedIssue: boolean;
  issue: IssueFull;
  issueId: string;
  issueLoaded: boolean;
  issueLoadingError: Error | null | undefined;
  isVisibilitySelectShown: boolean;
  isTagsSelectVisible: boolean;
  selectProps: Record<string, any> | null | undefined;
  showCommandDialog: boolean;
  suggestionsAreLoading: boolean;
  summaryCopy: string;
  unloadedIssueState: IssueState | null | undefined;
  updateUserAppearanceProfile: (...args: any[]) => any;
  user: User | null;
  isConnected: boolean;
  usersCC: Array<UserCC> | null;
  issueSprints: IssueSprint[];
};

export const initialState: IssueState = {
  attachingImage: null,
  commandIsApplying: false,
  commandSuggestions: null,
  commentsCounter: 0,
  descriptionCopy: '',
  editMode: false,
  initialCommand: '',
  isAttachFileDialogVisible: false,
  isRefreshing: false,
  isSavingEditedIssue: false,
  issue: null,
  issueId: '',
  issueLoaded: false,
  issueLoadingError: null,
  isVisibilitySelectShown: false,
  isTagsSelectVisible: false,
  selectProps: null,
  showCommandDialog: false,
  suggestionsAreLoading: false,
  summaryCopy: '',
  unloadedIssueState: null,
  updateUserAppearanceProfile: null,
  user: null,
  isConnected: false,
  usersCC: null,
  issueSprints: [],
};
export type IssueBaseActions = {
  SET_ISSUE_ID: (action: {
    issueId: string;
  }) => IssueState;
  START_ISSUE_REFRESHING: () => IssueState;
  STOP_ISSUE_REFRESHING: () => IssueState;
  RECEIVE_ISSUE: (action: {
    issue: IssueFull;
  }) => IssueState;
  RECEIVE_ISSUE_LINKS: (action: {
    links: IssueLink[];
  }) => IssueState;
  RECEIVE_ISSUE_VISIBILITY: (action: {
    visibility: Visibility;
  }) => IssueState;
  RECEIVE_ISSUE_ERROR: (action: {
    error: CustomError;
  }) => IssueState;
  START_EDITING_ISSUE: () => IssueState;
  STOP_EDITING_ISSUE: () => IssueState;
  SET_ISSUE_SUMMARY_AND_DESCRIPTION: (
    action: {
      summary: string;
      description: string;
    }
  ) => IssueState;
  SET_ISSUE_SUMMARY_COPY: (action: {
    summary: string;
  }) => IssueState;
  SET_ISSUE_DESCRIPTION_COPY: (action: {
    description: string;
  }) => IssueState;
  START_SAVING_EDITED_ISSUE: () => IssueState;
  STOP_SAVING_EDITED_ISSUE: () => IssueState;
  SET_ISSUE_FIELD_VALUE: (action: {
    field: CustomField;
    value: FieldValue;
  }) => IssueState;
  SET_PROJECT: (action: {
    project: Project;
  }) => IssueState;
  SET_VOTED: (action: {
    voted: boolean;
  }) => IssueState;
  SET_STARRED: (action: {
    starred: boolean;
  }) => IssueState;
  UNLOAD_ACTIVE_ISSUE_VIEW: () => IssueState;
  OPEN_ISSUE_SELECT: (action: {selectProps: ISelectProps<IItem>}) => IssueState;
  CLOSE_ISSUE_SELECT: (action: {selectProps: null}) => IssueState;
  SET_USERS_CC: (action: UserCC[]) => IssueState;
  SET_ISSUE_SPRINTS: (action: IssueSprint[]) => IssueState;
};

export const createAttachmentReducer = (types: Record<keyof typeof attachmentActionMap, string>) => ({
  [types.ATTACH_START_ADDING](
    state: IssueState,
    action: {
      attachingImage: Record<string, any>;
    }
  ): IssueState {
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

  [types.ATTACH_CANCEL_ADDING](
    state: IssueState,
    action: {
      attachingImage: Record<string, any>;
    }
  ): IssueState {
    const {attachingImage} = action;
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: state.issue.attachments.filter(
          attachment => attachment !== attachingImage
        ),
      },
      attachingImage: null,
    };
  },

  [types.ATTACH_REMOVE](
    state: IssueState,
    action: {
      attachmentId: string;
    }
  ): IssueState {
    return {
      ...state,
      issue: {
        ...state.issue,
        attachments: state.issue.attachments.filter(
          attach => attach.id !== action.attachmentId
        ),
      },
    };
  },

  [types.ATTACH_STOP_ADDING](state: IssueState): IssueState {
    return {...state, attachingImage: null};
  },

  [types.ATTACH_TOGGLE_ADD_FILE_DIALOG](
    state: IssueState,
    action: {
      isAttachFileDialogVisible: boolean;
    }
  ): IssueState {
    return {
      ...state,
      isAttachFileDialogVisible: action.isAttachFileDialogVisible,
    };
  },

  [types.ATTACH_RECEIVE_ALL_ATTACHMENTS](
    state: IssueState,
    action: {
      attachments: boolean;
    }
  ): IssueState {
    return {...state, issue: {...state.issue, attachments: action.attachments}};
  },
});
export const createIssueReduxSlice: (
  namespace: string,
  extraReducers: Record<string, any>
) => {
  actions: IssueBaseActions;
  reducer: SliceCaseReducers<IssueState>;
} = (namespace: string = '', extraReducers: Record<string, any> = {}) =>
  createSlice({
    name: `${namespace}/issue`,
    initialState,
    extraReducers,
    reducers: {
      SET_ISSUE_ID: (
        state: IssueState,
        action: {
          payload: {
            issueId: string;
          };
        }
      ) => {
        state.issueId = action.payload.issueId;
      },
      START_ISSUE_REFRESHING: (state: IssueState) => {
        state.isRefreshing = true;
      },
      STOP_ISSUE_REFRESHING: (state: IssueState) => {
        state.isRefreshing = false;
      },
      RECEIVE_ISSUE: (
        state: IssueState,
        action: {
          payload: {
            issue: IssueFull;
          };
        }
      ) => {
        state.issue = action.payload.issue;
        state.issueLoaded = true;
        state.issueLoadingError = null;
        state.commentsCounter = state.issue?.comments?.length || 0;
      },
      RECEIVE_ISSUE_LINKS: (
        state: IssueState,
        action: {
          payload: {
            links: IssueLink[];
          };
        }
      ) => {
        state.issue = {...state.issue, links: action.payload.links};
      },
      RECEIVE_ISSUE_VISIBILITY: (
        state: IssueState,
        action: {
          payload: {
            visibility: Visibility;
          };
        }
      ) => {
        state.issue = {...state.issue, visibility: action.payload.visibility};
      },
      RECEIVE_ISSUE_ERROR: (
        state: IssueState,
        action: {
          payload: {
            error: Error;
          };
        }
      ) => {
        state.issueLoadingError = action.payload.error;
      },
      START_EDITING_ISSUE: (state: IssueState) => {
        state.summaryCopy = state.issue.summary;
        state.descriptionCopy = state.issue.description;
        state.editMode = true;
      },
      STOP_EDITING_ISSUE: (state: IssueState) => {
        state.issue = {
          ...state.issue,
          fields: state.issue._fields || state.issue.fields,
        };
        state.summaryCopy = '';
        state.descriptionCopy = '';
        state.editMode = false;
      },
      SET_ISSUE_SUMMARY_AND_DESCRIPTION: (
        state: IssueState,
        action: {
          payload: {
            summary: string;
            description: string;
          };
        }
      ) => {
        state.issue = {
          ...state.issue,
          summary: action.payload.summary,
          description: action.payload.description,
        };
      },
      SET_ISSUE_SUMMARY_COPY: (
        state: IssueState,
        action: {
          payload: {
            summary: string;
          };
        }
      ) => {
        state.summaryCopy = action.payload.summary;
      },
      SET_ISSUE_DESCRIPTION_COPY: (
        state: IssueState,
        action: {
          payload: {
            description: string;
          };
        }
      ) => {
        state.descriptionCopy = action.payload.description;
      },
      START_SAVING_EDITED_ISSUE: (state: IssueState) => {
        state.isSavingEditedIssue = true;
      },
      STOP_SAVING_EDITED_ISSUE: (state: IssueState) => {
        state.isSavingEditedIssue = false;
      },
      SET_ISSUE_FIELD_VALUE: (
        state: IssueState,
        action: {
          payload: {
            field: CustomField;
            value: FieldValue;
          };
        }
      ) => {
        state.issue = {
          ...state.issue,
          _fields: state.issue?.fields || [],
          fields: (state.issue?.fields || []).map((cf: CustomField) => {
            return cf.id === action.payload.field.id
              ? {...cf, value: action.payload.value}
              : cf;
          }),
        };
      },
      SET_PROJECT: (
        state: IssueState,
        action: {
          payload: {
            project: Project;
          };
        }
      ) => {
        state.issue = {...state.issue, project: action.payload.project};
      },
      SET_VOTED: (
        state: IssueState,
        action: {
          payload: {
            voted: boolean;
          };
        }
      ) => {
        const voted: boolean = action.payload.voted;
        const votes: number = (state.issue?.votes || 0) + (voted ? 1 : -1);

        if (votes >= 0) {
          state.issue = {
            ...state.issue,
            votes,
            voters: {...state.issue.voters, hasVote: voted},
          };
        }
      },
      SET_STARRED: (
        state: IssueState,
        action: {
          payload: {
            starred: boolean;
          };
        }
      ) => {
        state.issue = {
          ...state.issue,
          watchers: {
            ...state?.issue?.watchers,
            hasStar: action.payload.starred,
          },
        };
      },
      UNLOAD_ACTIVE_ISSUE_VIEW: (state: IssueState) => {
        state = {...initialState, unloadedIssueState: state};
        return state;
      },
      OPEN_ISSUE_SELECT: (
        state: IssueState,
        action: {
          payload: {
            selectProps: Record<string, any>;
          };
        }
      ) => {
        state.selectProps = action.payload.selectProps;
        state.isTagsSelectVisible = true;
      },
      CLOSE_ISSUE_SELECT: (
        state: IssueState,
        action: {
          payload: {
            selectProps: Record<string, any>;
          };
        }
      ) => {
        state.selectProps = action.payload.selectProps;
        state.isTagsSelectVisible = false;
      },
      SET_USERS_CC: (state: IssueState, action: PayloadAction<UserCC[]>) => {
        state.usersCC = action.payload;
      },
      SET_ISSUE_SPRINTS: (state: IssueState, action: PayloadAction<IssueSprint[]>) => {
        state.issueSprints = action.payload;
      },
    },
  });
