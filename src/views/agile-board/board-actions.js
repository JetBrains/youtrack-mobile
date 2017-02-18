/* @flow */
import * as types from './board-action-types';
import {notifyError} from '../../components/notification/notification';
import type {AgileBoardRow, AgileColumn, BoardOnList} from '../../flow/Agile';

const PAGE_SIZE = 4;

function startSprintLoad() {
  return {type: types.START_SPRINT_LOADING};
}

function stopSprintLoad() {
  return {type: types.STOP_SPRINT_LOADING};
}

function receiveSprint(sprint) {
  return {
    type: types.RECEIVE_SPRINT,
    sprint
  };
}

function loadSprint(agileId: string, sprintId: string) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const {api} = getState().app;
    dispatch(startSprintLoad());
    try {
      const sprint = await api.getSprint(agileId, sprintId, PAGE_SIZE);
      dispatch(receiveSprint(sprint));
      await api.saveLastVisitedSprint(sprintId);
    } catch (e) {
      notifyError('Could not load sprint', e);
    } finally {
      dispatch(stopSprintLoad());
    }
  };
}

function loadBoard(boardId: string, sprints: {id: string}) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const lastSprint = sprints[0];
    dispatch(loadSprint(boardId, lastSprint.id));
  };
}

export function fetchDefaultAgileBoard() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const {api} = getState().app;

    const profile = await api.getAgileUserProfile();
    const lastSprint = profile.visitedSprints.filter(s => s.agile.id === profile.defaultAgile.id)[0];
    dispatch(loadSprint(lastSprint.agile.id, lastSprint.id));
  };
}

function startSwimlanesLoading() {
  return {type: types.START_SWIMLANES_LOADING};
}

function stopSwimlanesLoading() {
  return {type: types.STOP_SWIMLANES_LOADING};
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
    const {sprint, noMoreSwimlanes, isLoadingMore} = getState().agile;
    const {api} = getState().app;
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
    const {sprint} = getState().agile;
    const {api} = getState().app;
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

function updateColumnCollapsedState(column, newCollapsed: boolean) {
  return {
    type: types.COLUMN_COLLAPSE_TOGGLE,
    column,
    newCollapsed
  };
}

export function columnCollapseToggle(column: AgileColumn) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const {sprint} = getState().agile;
    const {api} = getState().app;
    if (!sprint) {
      return;
    }
    const oldCollapsed = column.collapsed;

    dispatch(updateColumnCollapsedState(column, !column.collapsed));

    try {
      await api.updateColumnCollapsedState(sprint.agile.id, sprint.id, {
        ...column,
        collapsed: !column.collapsed
      });
    } catch (e) {
      dispatch(updateColumnCollapsedState(column, oldCollapsed));
      notifyError('Could not update column', e);
    }
  };
}

export function closeSelect() {
  return {type: types.CLOSE_AGILE_SELECT};
}

export function openSprintSelect() {
  return (dispatch: (any) => any, getState: () => Object) => {
    const {sprint} = getState().agile;
    const {api} = getState().app;
    if (!sprint) {
      return;
    }

    dispatch({
      type: types.OPEN_AGILE_SELECT,
      selectProps: {
        show: true,
        title: 'Select sprint',
        dataSource: () => api.getSprintList(sprint.agile.id),
        onSelect: selectedSprint => {
          dispatch(closeSelect());
          dispatch(loadSprint(sprint.agile.id, selectedSprint.id));
        }
      }
    });
  };
}

export function openBoardSelect() {
  return (dispatch: (any) => any, getState: () => Object) => {
    const {sprint} = getState().agile;
    const {api} = getState().app;
    if (!sprint) {
      return;
    }

    dispatch({
      type: types.OPEN_AGILE_SELECT,
      selectProps: {
        show: true,
        title: 'Select board',
        dataSource: () => api.getAgileBoardsList(),
        onSelect: (selectedBoard: BoardOnList) => {
          dispatch(closeSelect());
          dispatch(loadBoard(selectedBoard.id, selectedBoard.sprints));
        }
      }
    });
  };
}
