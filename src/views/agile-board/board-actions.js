/* @flow */
import * as types from './board-action-types';
import {notifyError} from '../../components/notification/notification';
import Api from '../../components/api/api';
import type Auth from '../../components/auth/auth';
import type {AgileBoardRow} from '../../flow/Agile';

const PAGE_SIZE = 4;

export function initializeApi(auth: Auth) {
  return {
    type: types.INITIALIZE_API,
    auth,
    api: new Api(auth)
  };
}

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

export function fetchAgileBoard() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const {api} = getState().board;
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

function startSwimlanesLoading() {
  return {
    type: types.START_SWIMLANES_LOADING
  };
}

function stopSwimlanesLoading() {
  return {
    type: types.STOP_SWIMLANES_LOADING
  };
}

function receiveSwimlanes(swimlanes) {
  return {
    type: types.RECEIVE_SWIMLANES,
    PAGE_SIZE,
    swimlanes
  };
}

export function fetchMoreSwimlanes() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const {api, sprint, noMoreSwimlanes, isLoadingMore} = getState().board;
    if (!sprint || noMoreSwimlanes || isLoadingMore) {
      return;
    }
    dispatch(startSwimlanesLoading());

    try {
      const swimlanes = await api.getSwimlanes(sprint.agile.id, sprint.id, PAGE_SIZE, sprint.board.trimmedSwimlanes.length);
      dispatch(receiveSwimlanes(swimlanes));
    } catch (e) {
      notifyError('Could not load swimlanes', e);
    } finally {
      dispatch(stopSwimlanesLoading());
    }
  };
}

function updateRowCollapsedState(row, newCollapsed: boolean) {
  return {
    type: types.ROW_COLLAPSE_TOGGLE,
    row,
    newCollapsed
  };
}

export function rowCollapseToggle(row: AgileBoardRow) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const {sprint, api} = getState().board;
    if (!sprint) {
      return;
    }
    const oldCollapsed = row.collapsed;

    dispatch(updateRowCollapsedState(row, !row.collapsed));

    try {
      await api.updateRowCollapsedState(sprint.agile.id, sprint.id, {
        ...row,
        collapsed: !row.collapsed
      });
    } catch (e) {
      dispatch(updateRowCollapsedState(row, oldCollapsed));
      notifyError('Could not update row', e);
    }
  };
}
