/* @flow */
import * as types from './board-action-types';
import {notifyError} from '../../components/notification/notification';
import type {AgileBoardRow, AgileColumn, BoardOnList} from '../../flow/Agile';
import type {IssueFull} from '../../flow/Issue';
import ServersideEvents from '../../components/api/api__serverside-events';
import type Api from '../../components/api/api';
import Router from '../../components/router/router';

const PAGE_SIZE = 4;
let serversideEvents = null;

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

function noAgileSelected() {
  return {type: types.NO_AGILE_SELECTED};
}

type ApiGetter = () => Api;

function loadSprint(agileId: string, sprintId: string) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    dispatch(startSprintLoad());
    destroyServersideEvents();
    try {
      const sprint = await api.getSprint(agileId, sprintId, PAGE_SIZE);
      dispatch(receiveSprint(sprint));
      dispatch(subscribeServersideUpdates());
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
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();

    const profile = await api.getAgileUserProfile();
    const lastSprint = profile.visitedSprints.filter(s => s.agile.id === profile.defaultAgile.id)[0];
    if (lastSprint) {
      dispatch(loadSprint(lastSprint.agile.id, lastSprint.id));
    } else {
      dispatch(noAgileSelected());
      dispatch(stopSprintLoad());
    }
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

function storeServersideEvents(serversideEventsInstance) {
  serversideEvents = serversideEventsInstance;
}

function destroyServersideEvents() {
  if (serversideEvents) {
    serversideEvents.close();
  }
  serversideEvents = null;
}

function removeIssueFromBoard(issueId: string) {
  return {type: types.REMOVE_ISSUE_FROM_BOARD, issueId};
}

export function fetchMoreSwimlanes() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint, noMoreSwimlanes, isLoadingMore} = getState().agile;
    const api: Api = getApi();
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
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();
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
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api = getApi();
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
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();
    if (!sprint) {
      return;
    }

    dispatch({
      type: types.OPEN_AGILE_SELECT,
      selectProps: {
        show: true,
        placeholder: 'Search for the sprint',
        dataSource: async () => {
          const res = await api.getSprintList(sprint.agile.id);
          return res.sort(it => it.archived);
        },
        selectedItems: [sprint],
        getTitle: sprint => `${sprint.name} ${sprint.archived ? '(archived)' : ''}`,
        onSelect: selectedSprint => {
          dispatch(closeSelect());
          dispatch(loadSprint(sprint.agile.id, selectedSprint.id));
        }
      }
    });
  };
}

export function openBoardSelect() {
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {sprint} = getState().agile;

    dispatch({
      type: types.OPEN_AGILE_SELECT,
      selectProps: {
        show: true,
        placeholder: 'Search for the board',
        dataSource: () => api.getAgileBoardsList(),
        selectedItems: [sprint.agile],
        onSelect: (selectedBoard: BoardOnList) => {
          dispatch(closeSelect());
          dispatch(loadBoard(selectedBoard.id, selectedBoard.sprints));
        }
      }
    });
  };
}

export function addCardToCell(cellId: string, issue: IssueFull) {
  return {type: types.ADD_CARD_TO_CELL, cellId, issue};
}

export function reorderSwimlanesOrCells(leadingId: ?string, movedId: string) {
  return {type: types.REORDER_SWIMLANES_OR_CELLS, leadingId, movedId};
}

export function updateIssueOnBoard(issue: IssueFull) {
  return {type: types.UPDATE_ISSUE_ON_BOARD, issue};
}

export function createCardForCell(columnId: string, cellId: string) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();
    try {
      const draft = await api.getIssueDraftForAgileCell(sprint.agile.id, sprint.id, columnId, cellId);
      Router.CreateIssue({
        api,
        draftId: draft.id,
        onCreate: createdIssue => dispatch(addCardToCell(cellId, createdIssue))
      });
    } catch (err) {
      notifyError('Could not create card', err);
    }
  };
}

export function subscribeServersideUpdates() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();

    serversideEvents = new ServersideEvents(api.config.backendUrl);
    serversideEvents.subscribeAgileBoardUpdates(sprint.eventSourceTicket);

    // serversideEvents.listenTo('sprintCellUpdate', data => {
    //   console.log('sprintCellUpdate', data)
    // });

    // serversideEvents.listenTo('sprintSwimlaneUpdate', data => {
    //   console.log('sprintSwimlaneUpdate', data)
    // });

    serversideEvents.listenTo('sprintIssueRemove', data => {
      dispatch(removeIssueFromBoard(data.removedIssue.id));
    });

    serversideEvents.listenTo('sprintIssueHide', data => {
      dispatch(removeIssueFromBoard(data.removedIssue.id));
    });

    serversideEvents.listenTo('sprintIssuesReorder', data => {
      data.reorders.forEach(function(reorder) {
        const leadingId = reorder.leading ? reorder.leading.id : null;
        dispatch(reorderSwimlanesOrCells(leadingId, reorder.moved.id));
      });
    });

    storeServersideEvents(serversideEvents);
  };
}
