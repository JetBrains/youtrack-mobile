/* @flow */
import * as types from './actionTypes';
import {notifyError} from '../../../components/notification/notification';
import type Api from '../../../components/api/api';

function startSprintLoad() {
  return {
    type: types.START_SPRINT_LOADING
  };
}

function stopSprintLoad() {
  return {
    type: types.STOP_SPRINT_LOADING
  };
}

function receiveSprint(sprint) {
  return {
    type: types.RECEIVE_SPRINT,
    sprint
  };
}

export function fetchAgileBoard(api: Api) {
  return async (dispatch: (any) => any) => {
    dispatch(startSprintLoad());

    try {
      const profile = await api.getAgileUserProfile();
      const lastSprint = profile.visitedSprints.filter(s => s.agile.id === profile.defaultAgile.id)[0];
      const sprint = await api.getSprint(lastSprint.agile.id, lastSprint.id, 4);
      dispatch(receiveSprint(sprint));
    } catch (e) {
      notifyError('Could not load sprint', e);
    } finally {
      dispatch(stopSprintLoad());
    }
  };
}

