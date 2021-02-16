/* @flow */

import * as activityHelper from './issue-activity__helper';
import * as types from '../issue-action-types';
import log from '../../../components/log/log';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../../../components/analytics/analytics-ids';
import {confirmation} from '../../../components/confirmation/confirmation';
import {getActivityCategories, getActivityAllTypes} from '../../../components/activity/activity-helper';
import {logEvent} from '../../../components/log/log-helper';
import {notify} from '../../../components/notification/notification';
import {sortAlphabetically, sortByOrdinal} from '../../../components/search/sorting';
import {until} from '../../../util/util';
import {WORK_ITEM_CREATE, WORK_ITEM_UPDATE} from '../../../components/issue-permissions/issue-permissions';

import type Api from '../../../components/api/api';
import type {Activity} from '../../../flow/Activity';
import type {Folder, User} from '../../../flow/User';
import type {State as SingleIssueState} from '../issue-reducers';
import type {WorkItem} from '../../../flow/Work';

type ApiGetter = () => Api;
type StateGetter = () => { issueState: SingleIssueState };


export function receiveActivityAPIAvailability(activitiesEnabled: boolean) {
  return {type: types.RECEIVE_ACTIVITY_API_AVAILABILITY, activitiesEnabled};
}

export function receiveActivityPage(activityPage: Array<Activity> | null) {
  return {type: types.RECEIVE_ACTIVITY_PAGE, activityPage};
}

export function receiveActivityPageError(error: Error) {
  return {type: types.RECEIVE_ACTIVITY_ERROR, error};
}

export function receiveActivityEnabledTypes() {
  return {
    type: types.RECEIVE_ACTIVITY_CATEGORIES,
    issueActivityTypes: getActivityAllTypes(),
    issueActivityEnabledTypes: activityHelper.getIssueActivitiesEnabledTypes()
  };
}

export function loadActivitiesPage(doNotReset: boolean = false) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issueId;
    const api: Api = getApi();

    dispatch(receiveActivityEnabledTypes());
    const activityCategories = getActivityCategories(
      activityHelper.getIssueActivitiesEnabledTypes()
    );

    if (!doNotReset) {
      dispatch(receiveActivityPage(null));
    }
    dispatch(receiveActivityAPIAvailability(true));

    try {
      log.info('Loading activities...');
      const activityPage: Array<Activity> = await api.issue.getActivitiesPage(issueId, activityCategories);
      dispatch(receiveActivityPage(activityPage));
      log.info('Received activities', activityPage);
    } catch (error) {
      dispatch(receiveActivityPageError(error));
      dispatch({type: types.RECEIVE_ACTIVITY_ERROR, error});
      log.warn('Failed to load activity', error);
    }
  };
}

export function getTimeTracking() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issueId;
    const api: Api = getApi();

    logEvent({
      message: 'Create spent time',
      analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
    });
    const [error, timeTracking] = await until(api.issue.timeTracking(issueId));
    if (error) {
      const msg: string = 'Failed to load time tracking';
      notify(msg, error);
      logEvent({message: msg, isError: true});
      return null;
    }
    return timeTracking;
  };
}

export function updateWorkItemDraft(draft: WorkItem) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issueId = getState().issueState.issueId;

    const [error, updatedDraft] = await until(api.issue.updateDraftWorkItem(issueId, draft));
    if (error) {
      const msg: string = 'Failed to update work item draft';
      notify(msg, error);
      logEvent({message: msg, isError: true});
      return null;
    }
    return updatedDraft;
  };
}

export function updateWorkItem() {
  logEvent({
    message: 'Update spent time',
    analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
  });
}

export function createWorkItem(draft: WorkItem) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issueId = getState().issueState.issueId;

    logEvent({
      message: 'Create work item',
      analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
    });
    const [error, updatedDraft] = await until(api.issue.createWorkItem(issueId, draft));
    if (error) {
      const msg: string = 'Failed to create work item';
      notify(msg, error);
      logEvent({message: msg, isError: true});
    }
    return updatedDraft;
  };
}

export function deleteWorkItemDraft() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issueId = getState().issueState.issueId;

    const [error] = await until(api.issue.deleteDraftWorkItem(issueId));
    if (error) {
      const msg: string = 'Failed to delete work item draft';
      notify(msg, error);
      logEvent({message: msg, isError: true});
    }
  };
}

export function getWorkItemAuthors() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const project: Folder = getState().issueState.issue.project;
    logEvent({
      message: 'SpentTime: form:get-authors',
      analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
    });
    const promises: Array<Promise<User>> = [
      WORK_ITEM_UPDATE,
      WORK_ITEM_CREATE
    ].map((permissionName: string) => {
      return api.user.getHubProjectUsers(encodeURIComponent(`access(project:${project.ringId},with:{${permissionName}})`));
    });
    const [error, users] = await until(promises, true);
    if (error) {
      const msg: string = 'Failed to load work item authors';
      notify(msg, error);
      logEvent({message: msg, isError: true});
      return [];
    }
    return users.reduce((list: Array<User>, user: User) => list.some(
      (it: User) => it.ringId === user.ringId) ? list : list.concat(user), []).sort(sortAlphabetically);
  };
}

export function getWorkItemTypes() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const projectId: string = getState().issueState.issue.project.id;
    logEvent({
      message: 'SpentTime: form:get-work-types',
      analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
    });
    const [error, projectTimeTrackingSettings] = await until(api.projects.getTimeTrackingSettings(projectId));
    if (error) {
      const msg: string = 'Failed to load project time tracking settings';
      notify(msg, error);
      logEvent({message: msg, isError: true});
      return {};
    }
    return projectTimeTrackingSettings.workItemTypes.sort(sortByOrdinal);
  };
}

export function deleteWorkItem(workItem: WorkItem) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issueId: string = getState().issueState.issueId;

    return confirmation(
      'Are you sure you want to delete work item?',
      'Delete'
    ).then(async () => {
      const [error] = await until(api.issue.deleteWorkItem(issueId, workItem.id));
      if (error) {
        const msg: string = 'Failed to delete work item ';
        notify(msg, error);
        logEvent({message: msg, isError: true});
        return false;
      }
      return true;
    });

  };
}
