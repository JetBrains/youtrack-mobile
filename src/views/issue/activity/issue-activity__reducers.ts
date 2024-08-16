import {createReducer} from 'redux-create-reducer';
import * as types from '../issue-action-types';
import {attachmentTypes} from './issue-activity__attachment-actions-and-types';
import {guid} from 'util/util';
import type {Activity, ActivityType} from 'types/Activity';
import type {CustomError} from 'types/Error';
import type {IssueComment} from 'types/CustomFields';
import type {IssueFull, IssueOnList, OpenNestedViewParams} from 'types/Issue';
import type {User, UserAppearanceProfile} from 'types/User';
import type {WorkTimeSettings} from 'types/Work';
import {ProjectTeam} from 'types/Project';

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
  issueActivityEnabledTypes: Array<ActivityType>;
  issueActivityTypes: Array<ActivityType>;
  issueLoadingError: Error | null | undefined;
  issuePlaceholder: IssueOnList;
  openNestedIssueView: (params: OpenNestedViewParams) => any;
  renderRefreshControl: (onRefreshCallback: () => void) => any;
  updateUserAppearanceProfile: (
    appearanceProfile: UserAppearanceProfile,
  ) => any;
  user: User;
  workTimeSettings: WorkTimeSettings | null | undefined;
  defaultProjectTeam: ProjectTeam | undefined;
  isLoading: boolean;
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
  issuePlaceholder: {} as IssueOnList,
  openNestedIssueView: () => {},
  renderRefreshControl: () => {},
  updateUserAppearanceProfile: () => {},
  user: null,
  workTimeSettings: null,
  defaultProjectTeam: undefined,
  isLoading: false,
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
      activityPage: Activity[];
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
  [types.SET_HELPDESK_DEFAULT_PROJECT_TEAM]: (
    state: State,
    action: {team?: ProjectTeam},
  ): State => {
    return {...state, defaultProjectTeam: action.team};
  },
});

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
