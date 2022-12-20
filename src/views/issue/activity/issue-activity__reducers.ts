import {createReducer} from 'redux-create-reducer';
import * as types from '../issue-action-types';
import {attachmentTypes} from './issue-activity__attachment-actions-and-types';
import {guid} from 'util/util';
import type {Activity} from 'flow/Activity';
import type {CustomError} from 'flow/Error';
import type {IssueComment} from 'flow/CustomFields';
import type {IssueFull, OpenNestedViewParams} from 'flow/Issue';
import type {User, UserAppearanceProfile} from 'flow/User';
import type {WorkTimeSettings} from 'flow/Work';
type ActivityPage = Array<Activity> | null;
export type State = {
  activitiesEnabled: boolean;
  activitiesLoadingError: Error | null | undefined;
  activityPage: ActivityPage;
  attachingImage: Record<string, any> | null;
  removingImageId: string | null;
  isAttachFileDialogVisible: boolean;
  isSavingEditedIssue: boolean;
  issue: IssueFull;
  issueActivityEnabledTypes: Array<Record<string, any>>;
  issueActivityTypes: Array<Record<string, any>>;
  issueLoadingError: Error | null | undefined;
  issuePlaceholder: Partial<IssueFull>;
  openNestedIssueView: (params: OpenNestedViewParams) => any;
  renderRefreshControl: (arg0: () => void) => any;
  updateUserAppearanceProfile: (
    appearanceProfile: UserAppearanceProfile,
  ) => any;
  user: User;
  workTimeSettings: WorkTimeSettings | null | undefined;
};
export const initialState: State = {
  activitiesEnabled: false,
  activitiesLoadingError: null,
  activityPage: null,
  attachingImage: null,
  removingImageId: null,
  isAttachFileDialogVisible: false,
  isSavingEditedIssue: false,
  issue: null,
  issueActivityEnabledTypes: [],
  issueActivityTypes: [],
  issueLoadingError: null,
  issuePlaceholder: {},
  openNestedIssueView: () => {},
  renderRefreshControl: () => {},
  updateUserAppearanceProfile: () => {},
  user: null,
  workTimeSettings: null,
};
const attachmentReducers = {
  [attachmentTypes.ATTACH_START_ADDING](
    state: State,
    action: {
      attachingImage: Record<string, any>;
    },
  ) {
    return {...state, attachingImage: {...action.attachingImage, id: guid()}};
  },

  [attachmentTypes.ATTACH_CANCEL_ADDING](
    state: State,
    action: {
      attachingImage: Record<string, any>;
    },
  ) {
    return {...state, attachingImage: null};
  },

  [attachmentTypes.ATTACH_REMOVE](
    state: State,
    action: {
      attachmentId: string;
    },
  ) {
    return {...state, removingImageId: action.attachmentId};
  },

  [attachmentTypes.ATTACH_STOP_ADDING](state: State) {
    return {...state, attachingImage: null};
  },

  [attachmentTypes.ATTACH_TOGGLE_ADD_FILE_DIALOG](
    state: State,
    action: {
      isAttachFileDialogVisible: boolean;
    },
  ) {
    return {
      ...state,
      isAttachFileDialogVisible: action.isAttachFileDialogVisible,
    };
  },
};
export default createReducer(initialState, {
  ...attachmentReducers,
  [types.LOADING_ACTIVITY_PAGE]: (
    state: State,
    action: {
      isLoading: boolean;
    },
  ): State => {
    const {isLoading} = action;
    return {...state, isLoading};
  },
  [types.RECEIVE_ACTIVITY_PAGE]: (
    state: State,
    action: {
      activityPage: Array<Activity>;
    },
  ): State => {
    const {activityPage} = action;
    return {...state, activityPage, activitiesLoadingError: null};
  },
  [types.RECEIVE_ACTIVITY_ERROR]: (
    state: State,
    action: {
      error: CustomError;
    },
  ): State => {
    return {...state, activitiesLoadingError: action.error};
  },
  [types.RECEIVE_ACTIVITY_API_AVAILABILITY]: (
    state: State,
    action: Record<string, any>,
  ): State => {
    return {...state, activitiesEnabled: action.activitiesEnabled};
  },
  [types.RECEIVE_ACTIVITY_CATEGORIES]: (
    state: State,
    action: Record<string, any>,
  ): State => {
    return {
      ...state,
      issueActivityTypes: action.issueActivityTypes,
      issueActivityEnabledTypes: action.issueActivityEnabledTypes,
    };
  },
  [types.RECEIVE_WORK_TIME_SETTINGS]: (
    state: State,
    action: {
      workTimeSettings: WorkTimeSettings;
    },
  ): State => {
    return {...state, workTimeSettings: action.workTimeSettings};
  },
  [types.RECEIVE_UPDATED_COMMENT]: (
    state: State,
    action: {
      comment: IssueComment;
    },
  ): State => {
    const {comment} = action;
    const newActivityPage = replaceCommentInActivityPage(
      state.activityPage,
      comment,
    );
    return {...state, activityPage: newActivityPage};
  },
  [types.DELETE_COMMENT]: (
    state: State,
    action: {
      comment: IssueComment;
      activityId: string;
    },
  ): State => {
    const newActivityPage = removeCommentFromActivityPage(
      state.activityPage,
      action.activityId,
    );
    return {...state, activityPage: newActivityPage};
  },
}) as any;

function removeCommentFromActivityPage(
  activityPage: ActivityPage,
  activityId: string,
): ActivityPage {
  if (activityId) {
    return (activityPage || []).filter(it => it.id !== activityId);
  }

  return activityPage;
}

function replaceCommentInActivityPage(
  activityPage: ActivityPage = [],
  comment: IssueComment,
): ActivityPage {
  return (activityPage || []).map(activity => {
    if (Array.isArray(activity.added)) {
      activity.added = activity.added.map(it =>
        it.id === comment.id ? comment : it,
      );
    }

    return activity;
  });
}