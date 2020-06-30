/* @flow */

import * as types from '../single-issue-action-types';
import {notify} from '../../../components/notification/notification';
import log from '../../../components/log/log';
import type {IssueActivity} from '../../../flow/Activity';
import type Api from '../../../components/api/api';
import type {State as SingleIssueState} from '../single-issue-reducers';
import * as activityHelper from './single-issue-activity__helper';

type ApiGetter = () => Api;
type StateGetter = () => { singleIssue: SingleIssueState };


export function receiveActivityAPIAvailability(activitiesEnabled: boolean) {
  return {type: types.RECEIVE_ACTIVITY_API_AVAILABILITY, activitiesEnabled};
}

export function receiveActivityPage(activityPage: Array<IssueActivity> | null) {
  return {type: types.RECEIVE_ACTIVITY_PAGE, activityPage};
}

export function receiveActivityPageError(error: Error) {
  return {type: types.RECEIVE_ACTIVITY_ERROR, error: error};
}

export function receiveActivityEnabledTypes() {
  return {
    type: types.RECEIVE_ACTIVITY_CATEGORIES,
    issueActivityTypes: activityHelper.getIssueActivityAllTypes(),
    issueActivityEnabledTypes: activityHelper.getIssueActivitiesEnabledTypes()
  };
}

export function loadActivitiesPage() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    dispatch(receiveActivityEnabledTypes());
    const activityCategories = activityHelper.getActivityCategories(
      activityHelper.getIssueActivitiesEnabledTypes()
    );

    dispatch(receiveActivityPage(null));
    dispatch(receiveActivityAPIAvailability(true));

    try {
      log.info('Loading activities...');
      const activityPage: Array<IssueActivity> = await api.issue.getActivitiesPage(issueId, activityCategories);
      dispatch(receiveActivityPage(activityPage));
      log.info('Received activities', activityPage);
    } catch (error) {
      dispatch(receiveActivityPageError(error));
      dispatch({type: types.RECEIVE_ACTIVITY_ERROR, error: error});
      notify('Failed to load activity', error);
    }
  };
}

