/* @flow */
import * as types from './board-action-types';
import {notifyError, notify} from '../../components/notification/notification';
import type {AgileBoardRow, AgileColumn, BoardOnList, AgileUserProfile} from '../../flow/Agile';
import type {IssueFull, IssueOnList} from '../../flow/Issue';
import ServersideEvents from '../../components/api/api__serverside-events';
import type Api from '../../components/api/api';
import Router from '../../components/router/router';
import log from '../../components/log/log';
import usage from '../../components/usage/usage';
import {findIssueOnBoard} from './board-updaters';
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

function updateAgileUserProfile(sprintId) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const profile: AgileUserProfile = await getApi().agile.updateAgileUserProfile(sprintId);
    dispatch({type: types.RECEIVE_AGILE_PROFILE, profile});
  };
}

function loadSprint(agileId: string, sprintId: string) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    dispatch(startSprintLoad());
    destroyServersideEvents();
    try {
      const sprint = await api.agile.getSprint(agileId, sprintId, PAGE_SIZE);
      LayoutAnimation.easeInEaseOut();
      dispatch(receiveSprint(sprint));
      dispatch(subscribeServersideUpdates());
      log.info(`Sprint ${sprintId} (agileBoardId="${agileId}") has been loaded`);
    } catch (e) {
      usage.trackEvent(CATEGORY_NAME, 'Load sprint', 'Error');
      notifyError('Could not load sprint', e);
    } finally {
      dispatch(stopSprintLoad());
    }
  };
}

function loadBoard(boardId: string, sprints: Array<{id: string}>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const profile = getState().agile.profile;
    const visitedSprintOnBoard = (profile.visitedSprints || []).filter(s => s.agile.id === boardId)[0];
    const targetSprint = visitedSprintOnBoard || sprints[sprints.length - 1];
    log.info(`Resolving sprint for board ${boardId}. Visited = ${visitedSprintOnBoard ? visitedSprintOnBoard.id : 'NOTHING'}, target = ${targetSprint.id}`);
    dispatch(loadSprint(boardId, targetSprint.id));
  };
}

export function loadAgileProfile() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const profile = await getApi().agile.getAgileUserProfile();
    dispatch({type: types.RECEIVE_AGILE_PROFILE, profile});
  };
}

export function fetchDefaultAgileBoard() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    await dispatch(loadAgileProfile());
    const profile = getState().agile.profile;
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

function moveIssue(movedId: string, cellId: string, leadingId: ?string) {
  return {type: types.MOVE_ISSUE, movedId, cellId, leadingId};
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
      const swimlanes = await api.agile.getSwimlanes(sprint.agile.id, sprint.id, PAGE_SIZE, sprint.board.trimmedSwimlanes.length);
      dispatch(receiveSwimlanes(swimlanes));
      log.info(`Loaded ${PAGE_SIZE} more swimlanes`);
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
      await api.agile.updateRowCollapsedState(sprint.agile.id, sprint.id, {
        ...row,
        collapsed: !row.collapsed
      });
      log.info(`Collapse state successfully updated for row ${row.id}, new state = ${!row.collapsed}`);
      usage.trackEvent(CATEGORY_NAME, 'Toggle row collapsing');
    } catch (e) {
      dispatch(updateRowCollapsedState(row, oldCollapsed));
      notifyError('Could not update row', e);
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
      await api.agile.updateColumnCollapsedState(sprint.agile.id, sprint.id, {
        ...column,
        collapsed: !column.collapsed
      });
      log.info(`Collapse state successfully updated for column ${column.id}, new state = ${!column.collapsed}`);
      usage.trackEvent(CATEGORY_NAME, 'Toggle column collapsing');
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
    usage.trackEvent(CATEGORY_NAME, 'Open sprint select');

    dispatch({
      type: types.OPEN_AGILE_SELECT,
      selectProps: {
        show: true,
        placeholder: 'Search for the sprint',
        dataSource: async () => {
          const res = await api.agile.getSprintList(sprint.agile.id);
          return res.sort(it => it.archived);
        },
        selectedItems: [sprint],
        getTitle: sprint => `${sprint.name} ${sprint.archived ? '(archived)' : ''}`,
        onSelect: selectedSprint => {
          dispatch(closeSelect());
          dispatch(loadSprint(sprint.agile.id, selectedSprint.id));
          dispatch(updateAgileUserProfile(selectedSprint.id));
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
        dataSource: () => api.agile.getAgileBoardsList(),
        selectedItems: sprint ? [sprint.agile] : [],
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
      const draft = await api.agile.getIssueDraftForAgileCell(sprint.agile.id, sprint.id, columnId, cellId);
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

export function onCardDrop(data: {columnId: string, cellId: string, leadingId: ?string, movedId: string}) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();

    try {
      const issueOnBoard = findIssueOnBoard(getState().agile.sprint.board, data.movedId);
      if (!issueOnBoard) {
        log.warn('Cannot find dragged issue on board');
        return;
      }

      const currentIndex = issueOnBoard.cell.issues.indexOf(issueOnBoard.issue);
      if (
        issueOnBoard.cell.id === data.cellId &&
        issueOnBoard.cell.issues[currentIndex - 1].id === data.leadingId
      ) {
        log.info('Card dropped to original position');
        return;
      }

      log.info(`Applying issue move: movedId="${data.movedId}", cellId="${data.cellId}", leadingId="${data.leadingId || ''}"`);

      LayoutAnimation.easeInEaseOut();
      dispatch(moveIssue(data.movedId, data.cellId, data.leadingId));

      await api.agile.updateCardPosition(
        sprint.agile.id,
        sprint.id,
        data.columnId,
        data.cellId,
        data.leadingId,
        data.movedId
      );

      usage.trackEvent(CATEGORY_NAME, 'Card drop');
    } catch (err) {
      // TODO: Rever state
      notifyError('Could not move card', err);
    }
  };
}
