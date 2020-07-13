/* @flow */

import {createReducer} from 'redux-create-reducer';
import IssuePermissions from '../../../components/issue-permissions/issue-permissions';
import * as types from '../single-issue-action-types';

import type {ActivityItem, IssueActivity} from '../../../flow/Activity';
import type {CustomError} from '../../../flow/Error';
import type {IssueComment} from '../../../flow/CustomFields';
import type {IssueFull, OpenNestedViewParams} from '../../../flow/Issue';
import type {User, UserAppearanceProfile} from '../../../flow/User';
import type {WorkTimeSettings} from '../../../flow/WorkTimeSettings';

type ActivityPage = Array<ActivityItem> | null;

export type State = {
  activitiesEnabled: boolean,
  activitiesLoadingError: ?Error,
  activityPage: ActivityPage,
  isSavingEditedIssue: boolean,
  issue: IssueFull,
  issueActivityEnabledTypes: Array<Object>,
  issueActivityTypes: Array<Object>,
  issueLoadingError: ?Error,
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object,
  openNestedIssueView: (params: OpenNestedViewParams) => any,
  renderRefreshControl: (() => void) => any,
  selectProps: Object,
  updateUserAppearanceProfile: (appearanceProfile: UserAppearanceProfile) => any,
  user: User,
  workTimeSettings: ?WorkTimeSettings,
};


function issuePermissionsNULL(): $Shape<IssuePermissions> { return {};}

export const initialState: State = {
  activitiesEnabled: false,
  activitiesLoadingError: null,
  activityPage: null,
  isSavingEditedIssue: false,
  issue: null,
  issueActivityEnabledTypes: [],
  issueActivityTypes: [],
  issueLoadingError: null,
  issuePermissions: issuePermissionsNULL(),
  issuePlaceholder: {},
  openNestedIssueView: () => {},
  renderRefreshControl: () => {},
  selectProps: {},
  updateUserAppearanceProfile: () => {},
  user: null,
  workTimeSettings: null,
};

export default createReducer(initialState, {
  [types.RECEIVE_ACTIVITY_PAGE]: (state: State, action: { activityPage: Array<IssueActivity> }): State => {
    const {activityPage} = action;
    return {
      ...state,
      activityPage,
      activitiesLoadingError: null
    };
  },
  [types.RECEIVE_ACTIVITY_ERROR]: (state: State, action: { error: CustomError }): State => {
    return {
      ...state,
      activitiesLoadingError: action.error
    };
  },
  [types.RECEIVE_ACTIVITY_API_AVAILABILITY]: (state: State, action: Object): State => {
    return {...state, activitiesEnabled: action.activitiesEnabled};
  },
  [types.RECEIVE_ACTIVITY_CATEGORIES]: (state: State, action: Object): State => {
    return {
      ...state,
      issueActivityTypes: action.issueActivityTypes,
      issueActivityEnabledTypes: action.issueActivityEnabledTypes
    };
  },
  [types.RECEIVE_WORK_TIME_SETTINGS]: (state: State, action: { workTimeSettings: WorkTimeSettings }): State => {
    return {
      ...state,
      workTimeSettings: action.workTimeSettings
    };
  },

  [types.RECEIVE_UPDATED_COMMENT]: (state: State, action: { comment: IssueComment }): State => {
    const {comment} = action;
    const newActivityPage = replaceCommentInActivityPage(state.activityPage, comment);

    return {
      ...state,
      activityPage: newActivityPage,
    };
  },
  [types.DELETE_COMMENT]: (state: State, action: { comment: IssueComment, activityId: string }): State => {
    const newActivityPage = removeCommentFromActivityPage(state.activityPage, action.activityId);
    return {
      ...state,
      activityPage: newActivityPage,
    };
  },
});


function removeCommentFromActivityPage(activityPage: ActivityPage, activityId: string): ActivityPage {
  if (activityId) {
    return (activityPage || []).filter(it => it.id !== activityId);
  }
  return activityPage;
}


function replaceCommentInActivityPage(activityPage: ActivityPage = [], comment: IssueComment): ActivityPage {
  return (activityPage || []).map((activity) => {
    if (Array.isArray(activity.added)) {
      activity.added = activity.added.map(it => it.id === comment.id ? comment : it);
    }
    return activity;
  });
}
