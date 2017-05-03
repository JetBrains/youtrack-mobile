/* @flow */
import * as types from './board-action-types';
import {notifyError, notify} from '../../components/notification/notification';
import type {AgileBoardRow, AgileColumn, BoardOnList} from '../../flow/Agile';
import type {IssueFull, IssueOnList} from '../../flow/Issue';
import ServersideEvents from '../../components/api/api__serverside-events';
import type Api from '../../components/api/api';
import Router from '../../components/router/router';
import log from '../../components/log/log';
import usage from '../../components/usage/usage';
import {LayoutAnimation} from 'react-native';

const PAGE_SIZE = 4;
const CATEGORY_NAME = 'Agile board';
const RECONNECT_TIMEOUT = 60000;
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
      LayoutAnimation.easeInEaseOut();
      dispatch(receiveSprint(sprint));
      dispatch(subscribeServersideUpdates());
      usage.trackEvent(CATEGORY_NAME, 'Load sprint', 'Success');
      await api.saveLastVisitedSprint(sprintId);
    } catch (e) {
      usage.trackEvent(CATEGORY_NAME, 'Load sprint', 'Error');
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
      usage.trackEvent(CATEGORY_NAME, 'Load more swimlanes');
    } catch (e) {
      notifyError('Could not load swimlanes', e);
    } finally {
      dispatch(stopSwimlanesLoading());
    }
  };
}

function updateRowCollapsedState(row, newCollapsed: boolean) {
  LayoutAnimation.easeInEaseOut();
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
      usage.trackEvent(CATEGORY_NAME, 'Toggle row collapsing');
    } catch (e) {
      dispatch(updateRowCollapsedState(row, oldCollapsed));
      notifyError('Could not update row', e, !row.collapsed);
    }
  };
}

function updateColumnCollapsedState(column, newCollapsed: boolean) {
  LayoutAnimation.easeInEaseOut();
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
      usage.trackEvent(CATEGORY_NAME, 'Toggle column collapsing');
    } catch (e) {
      dispatch(updateColumnCollapsedState(column, oldCollapsed));
      notifyError('Could not update column', e, !column.collapsed);
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
    usage.trackEvent(CATEGORY_NAME, 'Open sprint select');

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
          usage.trackEvent(CATEGORY_NAME, 'Change sprint');
        }
      }
    });
  };
}

export function openBoardSelect() {
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {sprint} = getState().agile;
    usage.trackEvent(CATEGORY_NAME, 'Open board select');

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
          usage.trackEvent(CATEGORY_NAME, 'Change board');
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

export function addOrUpdateCellOnBoard(issue: IssueOnList, rowId: string, columnId: string) {
  return {type: types.ADD_OR_UPDATE_CELL_ON_BOARD, issue, rowId, columnId};
}

export function updateSwimlane(swimlane: AgileBoardRow) {
  return {type: types.UPDATE_SWIMLANE, swimlane};
}

export function storeCreatingIssueDraft(draftId: string, cellId: string) {
  return {type: types.STORE_CREATING_ISSUE_DRAFT, draftId, cellId};
}

export function createCardForCell(columnId: string, cellId: string) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();
    try {
      const draft = await api.getIssueDraftForAgileCell(sprint.agile.id, sprint.id, columnId, cellId);
      dispatch(storeCreatingIssueDraft(draft.id, cellId));
      Router.CreateIssue({predefinedDraftId: draft.id});
      usage.trackEvent(CATEGORY_NAME, 'Open create card for cell');
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

    serversideEvents.listenTo('error', () => {
      setTimeout(() => {
        log.info('Reloading sprint and reconnecting to LiveUpdate...');
        dispatch(loadSprint(sprint.agile.id, sprint.id));
      }, RECONNECT_TIMEOUT);
    });

    serversideEvents.listenTo('sprintCellUpdate', data => {
      LayoutAnimation.easeInEaseOut();
      dispatch(addOrUpdateCellOnBoard(data.issue, data.row.id, data.column.id));
    });

    serversideEvents.listenTo('sprintSwimlaneUpdate', data => {
      LayoutAnimation.easeInEaseOut();
      dispatch(updateSwimlane(data.swimlane));
    });

    serversideEvents.listenTo('sprintIssueRemove', data => {
      LayoutAnimation.easeInEaseOut();
      dispatch(removeIssueFromBoard(data.removedIssue.id));
    });

    serversideEvents.listenTo('sprintIssueHide', data => {
      LayoutAnimation.easeInEaseOut();
      dispatch(removeIssueFromBoard(data.removedIssue.id));
    });

    serversideEvents.listenTo('sprintIssueMessage', function(data) {
      data.messages.forEach(msg => notify(msg));
    });

    serversideEvents.listenTo('sprintIssuesReorder', data => {
      LayoutAnimation.easeInEaseOut();
      data.reorders.forEach(function(reorder) {
        const leadingId = reorder.leading ? reorder.leading.id : null;
        dispatch(reorderSwimlanesOrCells(leadingId, reorder.moved.id));
      });
    });

    storeServersideEvents(serversideEvents);
  };
}
