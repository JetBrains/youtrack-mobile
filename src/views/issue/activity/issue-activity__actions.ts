import * as activityHelper from './issue-activity__helper';
import * as types from '../issue-action-types';
import log from 'components/log/log';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {confirmation} from 'components/confirmation/confirmation';
import {DEFAULT_ISSUE_STATE_FIELD_NAME} from '../issue-base-actions-creater';
import {
  getActivityAllTypes,
  getActivityCategories,
} from 'components/activity/activity-helper';
import {
  flushStoragePart,
  getStorageState,
} from '../../../components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {logEvent} from 'components/log/log-helper';
import {notifyError} from 'components/notification/notification';
import {sortAlphabetically, sortByOrdinal} from 'components/search/sorting';
import {until} from 'util/util';
import {
  WORK_ITEM_CREATE,
  WORK_ITEM_UPDATE,
} from 'components/issue-permissions/issue-permissions';
import type Api from 'components/api/api';
import type {Activity, ActivityType} from 'types/Activity';
import type {AnyIssue} from '../../../types/Issue';
import type {AppState} from '../../../reducers';
import type {CustomError} from 'types/Error';
import type {State as SingleIssueState} from '../issue-reducers';
import type {TimeTracking} from 'types/Work';
import type {User} from 'types/User';
import type {WorkItem} from 'types/Work';
type ApiGetter = () => Api;
type StateGetter = () => {
  issueState: SingleIssueState;
};
export function receiveActivityAPIAvailability(
  activitiesEnabled: boolean,
): {
  activitiesEnabled: boolean;
  type: any;
} {
  return {
    type: types.RECEIVE_ACTIVITY_API_AVAILABILITY,
    activitiesEnabled,
  };
}
export function receiveActivityPage(
  activityPage: Array<Activity> | null,
): {
  activityPage: Array<Activity> | null;
  type: any;
} {
  return {
    type: types.RECEIVE_ACTIVITY_PAGE,
    activityPage,
  };
}
export function receiveActivityPageError(
  error: Error,
): {
  error: Error;
  type: any;
} {
  return {
    type: types.RECEIVE_ACTIVITY_ERROR,
    error,
  };
}
export function loadingActivityPage(
  isLoading: boolean,
): {
  isLoading: boolean;
  type: any;
} {
  return {
    type: types.LOADING_ACTIVITY_PAGE,
    isLoading,
  };
}
export const createIssueActivityActions = (
  stateFieldName: string = DEFAULT_ISSUE_STATE_FIELD_NAME,
): any => {
  const actions = {
    receiveActivityEnabledTypes: function receiveActivityEnabledTypes(): {
      issueActivityEnabledTypes: Array<ActivityType>;
      issueActivityTypes: Array<ActivityType>;
      type: any;
    } {
      return {
        type: types.RECEIVE_ACTIVITY_CATEGORIES,
        issueActivityTypes: getActivityAllTypes(),
        issueActivityEnabledTypes: activityHelper.getIssueActivitiesEnabledTypes(),
      };
    },
    loadActivitiesPage: function loadActivitiesPage(
      doNotReset: boolean = false,
      issueId?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: AppState,
        getApi: ApiGetter,
      ) => {
        const targetIssueId: string =
          issueId || getState()[stateFieldName].issueId;
        const isOffline: boolean =
          getState().app?.networkState?.isConnected === false;

        if (isOffline) {
          const cachedIssue = getIssuesCache().find(
            (it: AnyIssue) => it.id === targetIssueId,
          );

          if (cachedIssue && cachedIssue.activityPage) {
            dispatch(receiveActivityPage(cachedIssue.activityPage));
            return;
          }
        }

        const api: Api = getApi();
        dispatch(
          createIssueActivityActions(
            stateFieldName,
          ).receiveActivityEnabledTypes(),
        );
        const activityCategories = getActivityCategories(
          activityHelper.getIssueActivitiesEnabledTypes(),
        );

        if (!doNotReset) {
          dispatch(receiveActivityPage(null));
        }

        dispatch(receiveActivityAPIAvailability(true));

        try {
          dispatch(loadingActivityPage(true));
          log.info('Loading activities...');
          const activityPage: Array<Activity> = await api.issue.getActivitiesPage(
            targetIssueId,
            activityCategories,
          );
          dispatch(receiveActivityPage(activityPage));
          updateCache(activityPage);
          log.info('Received activities');
        } catch (error) {
          dispatch(receiveActivityPageError(error));
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

        function updateCache(activityPage: Array<Activity>) {
          const updatedCache: Array<AnyIssue> = getIssuesCache().map(
            (it: AnyIssue) => {
              if (it.id === targetIssueId) {
                return {...it, activityPage};
              }

              return it;
            },
          );
          flushStoragePart({
            issuesCache: updatedCache,
          });
        }
      };
    },
    getTimeTracking: function getTimeTracking(
      issueId?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<TimeTracking | null> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const targetIssueId: string =
          issueId || getState()[stateFieldName].issueId;
        const api: Api = getApi();
        logEvent({
          message: 'Create spent time',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const [error, timeTracking] = await until(
          api.issue.timeTracking(targetIssueId),
        );

        if (error) {
          notifyError(error);
          return null;
        }

        return timeTracking;
      };
    },
    updateWorkItemDraft: function updateWorkItemDraft(
      draft: WorkItem,
      issueId?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<WorkItem | null> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const targetIssueId: string =
          issueId || getState()[stateFieldName].issueId;
        const [error, updatedDraft] = await until(
          api.issue.updateDraftWorkItem(targetIssueId, draft),
        );

        if (error) {
          notifyError(error);
          return null;
        }

        return updatedDraft;
      };
    },
    doUpdateWorkItem: function doUpdateWorkItem(
      workItem: WorkItem,
    ): (...args: Array<any>) => any {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        logEvent({
          message: 'Update spent time',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const api: Api = getApi();
        const targetIssueId: string =
          workItem.issue.id || getState()[stateFieldName].issueId;
        const [error] = await until(
          api.issue.createWorkItem(targetIssueId, workItem),
        );

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
    createWorkItem: function createWorkItem(
      draft: WorkItem,
      issueId?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<CustomError> | Promise<any> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const targetIssueId: string =
          issueId || getState()[stateFieldName].issueId;
        logEvent({
          message: 'Create work item',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const [error, updatedDraft] = await until(
          api.issue.createWorkItem(targetIssueId, draft),
        );

        if (error) {
          notifyError(error);
          return error;
        }

        return updatedDraft;
      };
    },
    deleteWorkItemDraft: function deleteWorkItemDraft(
      issueId?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const targetIssueId: string =
          issueId || getState()[stateFieldName].issueId;
        const [error] = await until(
          api.issue.deleteDraftWorkItem(targetIssueId),
        );

        if (error) {
          notifyError(error);
        }
      };
    },
    getWorkItemAuthors: function getWorkItemAuthors(
      projectRingId?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<any> | Promise<Array<Partial<User>>> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        logEvent({
          message: 'SpentTime: form:get-authors',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const promises: Array<Promise<Partial<User>>> = [
          WORK_ITEM_UPDATE,
          WORK_ITEM_CREATE,
        ].map((permissionName: string) => {
          return api.user.getHubProjectUsers(
            encodeURIComponent(
              `access(project:${projectRingId},with:{${permissionName}})`,
            ),
          );
        });
        const [error, users] = await until(promises, true);

        if (error) {
          notifyError(error);
          return [];
        }

        return users
          .reduce(
            (list: Array<User>, user: User) =>
              list.some((it: User) => it.ringId === user.ringId)
                ? list
                : list.concat(user),
            [],
          )
          .sort(sortAlphabetically);
      };
    },
    getWorkItemTypes: function getWorkItemTypes(
      projectId?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<any> | Promise<{}> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const targetProjectId: string =
          projectId || getState()[stateFieldName].issue.project.id;
        logEvent({
          message: 'SpentTime: form:get-work-types',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const [error, projectTimeTrackingSettings] = await until(
          api.projects.getTimeTrackingSettings(targetProjectId),
        );

        if (error) {
          notifyError(error);
          return {};
        }

        return projectTimeTrackingSettings.workItemTypes.sort(sortByOrdinal);
      };
    },
    deleteWorkItem: function deleteWorkItem(
      workItem: WorkItem,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<any> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const issueId: string =
          workItem?.issue?.id || getState()[stateFieldName].issueId;
        return confirmation(
          i18n('Are you sure you want to delete this work item?'),
          i18n('Delete'),
        ).then(async () => {
          const [error] = await until(
            api.issue.deleteWorkItem(issueId, workItem.id),
          );

          if (error) {
            notifyError(error);
            return false;
          }

          return true;
        });
      };
    },
  };
  return actions;
};
