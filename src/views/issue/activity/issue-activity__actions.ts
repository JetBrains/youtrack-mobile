import * as activityHelper from './issue-activity__helper';
import * as types from '../issue-action-types';
import log from 'components/log/log';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {confirmation} from 'components/confirmation/confirmation';
import {DEFAULT_ISSUE_STATE_FIELD_NAME} from '../issue-base-actions-creater';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {getActivityAllTypes, getActivityCategories} from 'components/activity/activity-helper';
import {i18n} from 'components/i18n/i18n';
import {isHelpdeskProject} from 'components/helpdesk';
import {logEvent} from 'components/log/log-helper';
import {notifyError} from 'components/notification/notification';
import {sortAlphabetically, sortByOrdinal} from 'components/search/sorting';
import {until} from 'util/util';
import {WORK_ITEM_CREATE, WORK_ITEM_UPDATE} from 'components/issue-permissions/issue-permissions';

import type Api from 'components/api/api';
import type {Activity, ActivityType} from 'types/Activity';
import type {AnyIssue, ListIssueProject} from 'types/Issue';
import type {DraftWorkItem, TimeTracking, WorkItemType} from 'types/Work';
import type {User} from 'types/User';
import type {WorkItem} from 'types/Work';
import {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';
import {Project, ProjectTeam} from 'types/Project';
import {IssueState} from 'views/issue/issue-base-reducer';
import {Entity} from 'types/Entity';

export function receiveActivityAPIAvailability(activitiesEnabled: boolean) {
  return {
    type: types.RECEIVE_ACTIVITY_API_AVAILABILITY,
    activitiesEnabled,
  };
}

export function receiveActivityPage(activityPage: Activity[] | null) {
  return {
    type: types.RECEIVE_ACTIVITY_PAGE,
    activityPage,
  };
}

export function receiveActivityPageError(error: Error) {
  return {
    type: types.RECEIVE_ACTIVITY_ERROR,
    error,
  };
}

export function loadingActivityPage(isLoading: boolean) {
  return {
    type: types.LOADING_ACTIVITY_PAGE,
    isLoading,
  };
}

export interface IssueActivityActions {
  getTimeTracking: (issueId?: string) => ReduxAction<Promise<TimeTracking | null>>;
  receiveActivityEnabledTypes: (commentsOnly?: boolean) => {
    issueActivityEnabledTypes: ActivityType[];
    issueActivityTypes: ActivityType[];
    type: any;
  };
  setDefaultProjectTeam: (project: Project | ListIssueProject) => ReduxAction;
  loadActivitiesPage: (doNotReset?: boolean, issueId?: string, commentsOnly?: boolean) => ReduxAction;
  doUpdateWorkItem: (workItem: WorkItem) => ReduxAction;
  submitWorkItem: (draft: WorkItem | DraftWorkItem, issueId?: string) => ReduxAction<Promise<WorkItem | null>>;
  getWorkItemTypes: (projectId?: string) => ReduxAction<Promise<WorkItemType[]>>;
  deleteWorkItemDraft: (issueId?: string) => ReduxAction;
  updateWorkItemDraft: (draft: Partial<WorkItem>, issueId?: string) => ReduxAction<Promise<WorkItem | null>>;
  getWorkItemAuthors: (projectRingId?: string) => ReduxAction<Promise<{ringId: string; name: string}[]>>;
  deleteWorkItem: (workItem: WorkItem) => ReduxAction<Promise<boolean>>;
}

export const createIssueActivityActions = (stateFieldName = DEFAULT_ISSUE_STATE_FIELD_NAME) => {
  const actions: IssueActivityActions = {
    receiveActivityEnabledTypes: function (commentsOnly?: boolean): {
      issueActivityEnabledTypes: ActivityType[];
      issueActivityTypes: ActivityType[];
      type: any;
    } {
      return {
        type: types.RECEIVE_ACTIVITY_CATEGORIES,
        issueActivityTypes: commentsOnly ? [] : getActivityAllTypes(),
        issueActivityEnabledTypes: activityHelper.getIssueActivitiesEnabledTypes(commentsOnly),
      };
    },
    loadActivitiesPage: function (doNotReset: boolean = false, issueId?: string, commentsOnly?: boolean): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const targetIssueId: string = issueId || (getState()[stateFieldName] as IssueState).issueId;
        const isOffline: boolean = getState().app?.networkState?.isConnected === false;

        if (isOffline) {
          const cachedIssue = getIssuesCache().find((it: AnyIssue) => it.id === targetIssueId);

          if (cachedIssue && cachedIssue.activityPage) {
            dispatch(receiveActivityPage(cachedIssue.activityPage));
            return;
          }
        }

        const api: Api = getApi();
        dispatch(createIssueActivityActions(stateFieldName).receiveActivityEnabledTypes(commentsOnly));
        const activityCategories = getActivityCategories(
          activityHelper.getIssueActivitiesEnabledTypes(commentsOnly)
        );

        if (!doNotReset) {
          dispatch(receiveActivityPage(null));
        }

        dispatch(receiveActivityAPIAvailability(true));

        try {
          dispatch(loadingActivityPage(true));
          log.info('Issue Actions: Loading activities...');
          const activityPage: Activity[] = await api.issue.getActivitiesPage(targetIssueId, activityCategories);
          dispatch(receiveActivityPage(activityPage));
          updateCache(activityPage);
          log.info('Issue Actions: Received activities');
        } catch (error) {
          dispatch(receiveActivityPageError(error as Error));
          dispatch({
            type: types.RECEIVE_ACTIVITY_ERROR,
            error,
          });
          log.warn('Failed to load activity', error);
        } finally {
          dispatch(loadingActivityPage(false));
        }

        function getIssuesCache() {
          return getStorageState().issuesCache || [];
        }

        function updateCache(activityPage: Activity[]) {
          const updatedCache: AnyIssue[] = getIssuesCache().map((it: AnyIssue) => {
            if (it.id === targetIssueId) {
              return {...it, activityPage};
            }

            return it;
          });
          flushStoragePart({
            issuesCache: updatedCache,
          });
        }
      };
    },
    getTimeTracking: function (issueId?: string): ReduxAction<Promise<TimeTracking | null>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const targetIssueId: string = issueId || (getState()[stateFieldName] as IssueState).issueId;
        const api: Api = getApi();
        logEvent({
          message: 'Create spent time',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const [error, timeTracking] = await until(api.issue.timeTracking(targetIssueId));

        if (error) {
          notifyError(error);
          return null;
        }

        return timeTracking;
      };
    },
    updateWorkItemDraft: function (draft: Partial<WorkItem>, issueId?: string): ReduxAction<Promise<WorkItem | null>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const targetIssueId: string = issueId || (getState()[stateFieldName] as IssueState).issueId;
        const [error, _draft] = await until<WorkItem>(getApi().issue.updateDraftWorkItem(targetIssueId, draft));
        if (error) {
          notifyError(error);
        }
        return error ? null : _draft;
      };
    },
    doUpdateWorkItem: function (workItem: WorkItem): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        logEvent({
          message: 'Update spent time',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const api: Api = getApi();
        const targetIssueId: string = workItem.issue.id || (getState()[stateFieldName] as IssueState).issueId;
        const [error] = await until(api.issue.submitWorkItem(targetIssueId, workItem));
        if (error) {
          notifyError(error);
        } else {
          logEvent({
            message: 'Work item checkbox updated',
            analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
          });
        }
      };
    },
    submitWorkItem: function (draft: WorkItem | DraftWorkItem, issueId?: string): ReduxAction<Promise<WorkItem | null>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const api: Api = getApi();
        const targetIssueId: string = issueId || (getState()[stateFieldName] as IssueState).issueId;
        logEvent({
          message: 'Create work item',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const [error, _draft] = await until<WorkItem>(api.issue.submitWorkItem(targetIssueId, draft));
        if (error) {
          notifyError(error);
        }
        return error ? null : _draft;
      };
    },
    deleteWorkItemDraft: function (issueId?: string): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const api: Api = getApi();
        const targetIssueId: string = issueId || (getState()[stateFieldName] as IssueState).issueId;
        const [error] = await until(api.issue.deleteDraftWorkItem(targetIssueId));

        if (error) {
          notifyError(error);
        }
      };
    },
    getWorkItemAuthors: function (projectRingId?: string): ReduxAction<Promise<{ringId: string; name: string}[]>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const api: Api = getApi();
        logEvent({
          message: 'SpentTime: form:get-authors',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const promises = [WORK_ITEM_UPDATE, WORK_ITEM_CREATE].map((permissionName: string) => {
          return api.user.getHubProjectUsers(
            encodeURIComponent(`access(project:${projectRingId},with:{${permissionName}})`)
          );
        });
        const [error, users] = await until(promises, true);

        if (error) {
          notifyError(error);
          return [];
        }

        return users
          .reduce(
            (list: User[], user: User) =>
              list.some((it: User) => it.ringId === user.ringId) ? list : list.concat(user),
            []
          )
          .sort(sortAlphabetically);
      };
    },
    getWorkItemTypes: function (projectId?: string): ReduxAction<Promise<WorkItemType[]>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const api: Api = getApi();
        const targetProjectId: string = projectId || (getState()[stateFieldName] as IssueState).issue.project.id;
        logEvent({
          message: 'SpentTime: form:get-work-types',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const [error, projectTimeTrackingSettings] = await until(api.projects.getTimeTrackingSettings(targetProjectId));
        if (error) {
          notifyError(error);
        }
        return error ? [] : projectTimeTrackingSettings.workItemTypes.sort(sortByOrdinal);
      };
    },
    deleteWorkItem: function (workItem: WorkItem): ReduxAction<Promise<boolean>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const api: Api = getApi();
        const issueId: string = workItem?.issue?.id || (getState()[stateFieldName] as IssueState).issueId;
        return confirmation(i18n('Are you sure you want to delete this work item?'), i18n('Delete')).then(async () => {
          const [error] = await until(api.issue.deleteWorkItem(issueId, workItem.id));

          if (error) {
            notifyError(error);
            return false;
          }

          return true;
        });
      };
    },
    setDefaultProjectTeam: function (project: Project | ListIssueProject): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        let team: ProjectTeam | undefined;
        if (isHelpdeskProject({project} as Entity)) {
          const [error, pt] = await until<ProjectTeam>(getApi().projects.getTeam(project.id));
          if (!error) {
            team = pt;
          }
        }
        dispatch({
          type: types.SET_HELPDESK_DEFAULT_PROJECT_TEAM,
          team,
        });
      };
    },
  };
  return actions;
};
