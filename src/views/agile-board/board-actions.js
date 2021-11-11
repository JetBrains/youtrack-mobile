/* @flow */

import * as types from './board-action-types';
import {findIssueOnBoard} from './board-updaters';

import * as issueUpdater from '../../components/issue-actions/issue-updater';
import animation from '../../components/animation/animation';
import log from '../../components/log/log';
import Router from '../../components/router/router';
import ServersideEvents from '../../components/api/api__serverside-events';
import usage from '../../components/usage/usage';
import {ANALYTICS_AGILE_PAGE} from '../../components/analytics/analytics-ids';
import {DEFAULT_ERROR_MESSAGE} from '../../components/error/error-messages';
import {flushStoragePart, getStorageState, MAX_STORED_QUERIES} from '../../components/storage/storage';
import {getAssistSuggestions} from '../../components/query-assist/query-assist-helper';
import {getGroupedSprints, getSprintAllIssues, updateSprintIssues} from './agile-board__helper';
import {isIOSPlatform, until} from '../../util/util';
import {ISSUE_UPDATED} from '../issue/issue-action-types';
import {notify} from '../../components/notification/notification';
import {routeMap} from '../../app-routes';
import {sortAlphabetically} from '../../components/search/sorting';

import type Api from '../../components/api/api';
import type {
  AgileBoardRow,
  AgileUserProfile,
  Board,
  BoardColumn,
  BoardOnList,
  Sprint,
  SprintFull,
} from '../../flow/Agile';
import type {AgilePageState} from './board-reducers';
import type {CustomError} from '../../flow/Error';
import type {IssueFull, IssueOnList} from '../../flow/Issue';

type ApiGetter = () => Api;

export const PAGE_SIZE = 15;

const RECONNECT_TIMEOUT = 60000;
let serverSideEventsInstance: ServersideEvents;
let serverSideEventsInstanceErrorTimer = null;
export const DEFAULT_ERROR_AGILE_WITH_INVALID_STATUS = {status: {valid: false, errors: [DEFAULT_ERROR_MESSAGE]}};

function startSprintLoad() {
  return {type: types.START_SPRINT_LOADING};
}

function stopSprintLoad() {
  return {type: types.STOP_SPRINT_LOADING};
}

function receiveSprint(sprint) {
  return {
    type: types.RECEIVE_SPRINT,
    sprint,
  };
}

function setError(error: CustomError | null) {
  return {
    type: types.AGILE_ERROR,
    error,
  };
}

function track(msg: string, additionalParam: ?string) {
  usage.trackEvent(ANALYTICS_AGILE_PAGE, msg, additionalParam);
}

function trackError(msg: string) {
  track(msg, 'Error');
}

function trackEvent(msg: string) {
  track(msg);
}

function animateLayout() {
  if (isIOSPlatform()) {
    animation.layoutAnimation();
  }
}

function getLastVisitedSprint(boardId: string, visitedSprints: ?Array<Sprint>): ?Sprint {
  return (visitedSprints || []).find((sprint: Sprint) => sprint.agile?.id === boardId);
}

export function getAgileUserProfile(): (dispatch: (any) => any, getState: () => any) => Promise<$Shape<AgileUserProfile>> {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const state = getState();
    return state?.agile?.profile || {};
  };
}

export function loadAgileWithStatus(agileId: string): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    dispatch({type: types.START_LOADING_AGILE});

    const cachedDefaultAgileBoard: ?Board = getStorageState().agileDefaultBoard;
    if (cachedDefaultAgileBoard) {
      dispatch(receiveAgile(cachedDefaultAgileBoard));
    }

    const agileWithStatus: Board = await dispatch(loadAgile(agileId));
    dispatch({type: types.STOP_LOADING_AGILE});
    flushStoragePart({agileDefaultBoard: agileWithStatus});

    if (!agileWithStatus.status.valid) {
      dispatch(receiveSprint(null));
      dispatch(stopSprintLoad());
    }
  };
}

export function loadBoard(board: Board, query: string, refresh: boolean = false): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    destroySSE();
    dispatch(updateAgileUserProfileLastVisitedAgile(board.id));

    dispatch(loadAgileWithStatus(board.id));

    const agileUserProfile: AgileUserProfile = await dispatch(getAgileUserProfile());

    const cachedAgileLastSprint: ?Sprint = getStorageState().agileLastSprint;
    let sprint: ?Sprint;
    if (!refresh && board.currentSprint) {
      sprint = board.currentSprint;
    } else {
      sprint = getLastVisitedSprint(board.id, agileUserProfile?.visitedSprints) || (
        cachedAgileLastSprint?.agile?.id === board.id ? cachedAgileLastSprint : null
      );
    }
    if (!sprint) {
      sprint = (board.sprints || []).slice(-1)[0];
      trackError('Cannot find last visited sprint');
      log.info('Last visited sprint is undefined. Use the last one of the current board.');
    }
    log.info(`Loading: Board ${board?.name}, Sprint = ${sprint?.name}`);

    dispatch(loadSprint(board.id, sprint.id, query));
  };
}

function updateAgileUserProfile(requestBody: Object) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const [error, profile] = await until(getApi().agile.updateAgileUserProfile(requestBody));
    if (!error) {
      dispatch({
        type: types.RECEIVE_AGILE_PROFILE,
        profile,
      });
    }
  };
}

function updateAgileUserProfileLastVisitedSprint(sprintId: string) {
  return async (dispatch: (any) => any) => {
    dispatch(updateAgileUserProfile({
      visitedSprints: [{id: sprintId}],
    }));
  };
}

function updateAgileUserProfileLastVisitedAgile(agileId: string) {
  return async (dispatch: (any) => any) => {
    dispatch(updateAgileUserProfile({
      defaultAgile: {id: agileId},
    }));
  };
}

function receiveAgile(agile: Board) {
  return {
    type: types.RECEIVE_AGILE,
    agile,
  };
}

export function loadAgile(agileId: string): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<$Shape<Board>>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();

    try {
      const agileWithStatus: Board = await api.agile.getAgile(agileId);
      dispatch(receiveAgile(agileWithStatus));
      log.info(`Loaded agile board ${agileId} status: ${agileWithStatus.status.valid}`);
      return agileWithStatus;
    } catch (error) {
      log.warn(`Cannot load agile board ${agileId} status`, error);
      return DEFAULT_ERROR_AGILE_WITH_INVALID_STATUS;
    }
  };
}

export async function cacheSprint(sprint: Sprint): Promise<void> {
  flushStoragePart({agileLastSprint: sprint});
}

export function suggestAgileQuery(query: string, caret: number): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const suggestions = await getAssistSuggestions(getApi(), query, caret);
    dispatch({type: types.AGILE_SEARCH_SUGGESTS, suggestions});
  };
}

export function loadSprint(agileId: string, sprintId: string, query: string): ((
  dispatch: (any) => any,
  getState: () => AgilePageState,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => AgilePageState, getApi: ApiGetter) => {
    const api: Api = getApi();
    dispatch(setError(null));
    dispatch(startSprintLoad());
    destroySSE();
    try {
      const sprint = await api.agile.getSprint(agileId, sprintId, PAGE_SIZE, 0, query);
      const state: AgilePageState = getState();
      if (!state?.agile?.sprint) {
        dispatch(receiveSprint(sprint));
      }
      dispatch(loadSprintIssues(sprint));
      dispatch(updateAgileUserProfileLastVisitedSprint(sprint.id));
      log.info(`Sprint ${sprintId} (agileBoardId="${agileId}") has been loaded`);
    } catch (e) {
      const message: string = 'Could not load requested sprint';
      const error: CustomError = ((new Error(message): any): CustomError);
      error.error_description = 'Check that the sprint exists';
      dispatch(setError(error));
      trackError('Load sprint');
      log.info(message, e);
      dispatch(stopSprintLoad());
    }
  };
}

export function loadSprintIssues(sprint: SprintFull): ((
  dispatch: (any) => any,
  getState: () => AgilePageState,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => AgilePageState, getApi: ApiGetter) => {
    const api: Api = getApi();
    dispatch(startSprintLoad());
    try {
      const allIssuesIds: Array<{id: string}> = getSprintAllIssues(sprint);
      const sprintIssues: Array<IssueFull> = await api.agile.getAgileIssues(allIssuesIds);
      const updatedSprint: Sprint = updateSprintIssues(sprint, sprintIssues);
      dispatch(receiveSprint(updatedSprint));

      animateLayout();

      cacheSprint(updatedSprint);
      dispatch(subscribeServersideUpdates());

    } catch (e) {
      const message: string = 'Could not load requested sprint issues';
      const error: CustomError = ((new Error(message): any): CustomError);
      error.error_description = 'Check that the sprint exists';
      trackError('Load sprint');

      dispatch(setError(error));
      log.info(message, e);
    } finally {
      dispatch(stopSprintLoad());
    }
  };
}

export function loadAgileProfile(): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    let profile;
    try {
      profile = await getApi().agile.getAgileUserProfile();
      dispatch({
        type: types.RECEIVE_AGILE_PROFILE,
        profile,
      });
    } catch (error) {
      dispatch(setError(error));
    }
  };
}

export function loadDefaultAgileBoard(query: string, refresh: boolean): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    dispatch(setError(null));
    dispatch(receiveSprint(getStorageState().agileLastSprint));

    await dispatch(loadAgileProfile());

    const agileUserProfile: AgileUserProfile = await dispatch(getAgileUserProfile());
    const board: ?Board = agileUserProfile?.defaultAgile;

    if (board) {
      log.info('Loading Default Agile board', board?.name || board?.id);
      await dispatch(loadBoard(board, query, refresh));
    } else {
      dispatch(receiveSprint(null));
      const error: CustomError & { noAgiles: boolean } = (new Error('No agile boards found'): any);
      error.error_description = 'Create an agile board first';
      error.noAgiles = true;
      dispatch(setError(error));
      trackError('Default board is unknown');
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
    swimlanes,
  };
}

function setSSEInstance(sseInstance: ?ServersideEvents) {
  serverSideEventsInstance = sseInstance;
}

export function destroySSE() {
  if (serverSideEventsInstance) {
    log.info('Force close SSE');

    clearTimeout(serverSideEventsInstanceErrorTimer);
    serverSideEventsInstanceErrorTimer = null;

    serverSideEventsInstance.close();
    setSSEInstance(null);
  }
}

function removeIssueFromBoard(issueId: string) {
  return {
    type: types.REMOVE_ISSUE_FROM_BOARD,
    issueId,
  };
}

function moveIssue(movedId: string, cellId: string, leadingId: ?string) {
  return {
    type: types.MOVE_ISSUE,
    movedId,
    cellId,
    leadingId,
  };
}

export function fetchMoreSwimlanes(query?: string): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint, noMoreSwimlanes, isLoadingMore} = getState().agile;
    const api: Api = getApi();
    if (!sprint || noMoreSwimlanes || isLoadingMore) {
      return;
    }
    dispatch(startSwimlanesLoading());

    try {
      const swimlanes = await api.agile.getSwimlanes(
        sprint.agile.id,
        sprint.id,
        PAGE_SIZE,
        sprint.board.trimmedSwimlanes.length,
        query
      );
      dispatch(receiveSwimlanes(swimlanes));
      log.info(`Loaded ${swimlanes.length} more swimlanes`);
      trackEvent('Load more swimlanes');
    } catch (e) {
      notify('Could not load swimlanes', e);
    } finally {
      dispatch(stopSwimlanesLoading());
    }
  };
}

function updateRowCollapsedState(row, newCollapsed: boolean) {
  animateLayout();
  return {
    type: types.ROW_COLLAPSE_TOGGLE,
    row,
    newCollapsed,
  };
}

export function rowCollapseToggle(row: AgileBoardRow): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
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
        collapsed: !row.collapsed,
      });
      log.info(`Collapse state successfully updated for row ${row.id}, new state is = ${oldCollapsed ? 'expanded' : 'collapsed'}`);
      trackEvent('Toggle row collapsing');
    } catch (e) {
      dispatch(updateRowCollapsedState(row, oldCollapsed));
      notify('Could not update row', e);
    }
  };
}

function updateColumnCollapsedState(column, newCollapsed: boolean) {
  animateLayout();
  return {
    type: types.COLUMN_COLLAPSE_TOGGLE,
    column,
    newCollapsed,
  };
}

export function columnCollapseToggle(column: BoardColumn): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
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
        collapsed: !column.collapsed,
      });
      log.info(`Collapse state successfully updated for column ${column.id}, new state is ${oldCollapsed ? 'expanded' : 'collapsed'}`);
      trackEvent('Toggle column collapsing');
    } catch (e) {
      dispatch(updateColumnCollapsedState(column, oldCollapsed));
      notify('Could not update column', e);
    }
  };
}

export function closeSelect(): {type: any} {
  return {type: types.CLOSE_AGILE_SELECT};
}

export function openSprintSelect(): ((dispatch: (any) => any, getState: () => any, getApi: ApiGetter) => void) {
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();
    if (!sprint) {
      return;
    }
    trackEvent('Open sprint select');

    dispatch({
      type: types.OPEN_AGILE_SELECT,
      selectProps: {
        show: true,
        placeholder: 'Filter sprints by name',
        dataSource: async () => {
          const sprints = await api.agile.getSprintList(sprint.agile.id);
          return getGroupedSprints(sprints);
        },
        selectedItems: [sprint],
        getTitle: sprint => `${sprint.name} ${sprint.archived ? '(archived)' : ''}`,
        onSelect: (selectedSprint: Sprint, query: string) => {
          dispatch(closeSelect());
          dispatch(loadSprint(sprint.agile.id, selectedSprint.id, query));
          trackEvent('Change sprint');
        },
      },
    });
  };
}

export function openBoardSelect(): ((dispatch: (any) => any, getState: () => any, getApi: ApiGetter) => void) {
  return (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {sprint, agile} = getState().agile;
    trackEvent('Open board select');

    dispatch(setError(null));
    dispatch({
      type: types.OPEN_AGILE_SELECT,
      selectProps: {
        show: true,
        placeholder: 'Filter boards by name',
        dataSource: async () => {
          const agileBoardsList: Array<BoardOnList> = await api.agile.getAgileBoardsList();
          const boards = agileBoardsList.sort(sortAlphabetically).reduce(
            (list: { favorites: Array<Board>, regular: Array<Board> }, board: Board) => {
              if (board.favorite) {
                list.favorites.push(board);
              } else {
                list.regular.push(board);
              }
              return list;
            },
            {
              favorites: [],
              regular: [],
            }
          );
          return [].concat(boards.favorites).concat(boards.regular);
        },
        selectedItems: sprint ? [sprint.agile] : agile ? [agile] : [],
        onSelect: async (selectedBoard: BoardOnList, query: string = '') => {
          dispatch(closeSelect());
          dispatch(receiveSprint(null));
          dispatch(startSprintLoad());
          await flushStoragePart({agileQuery: null});
          dispatch(loadBoard(selectedBoard, query));
          trackEvent('Change board');
        },
      },
    });
  };
}

export function addCardToCell(cellId: string, issue: IssueFull): {cellId: string, issue: IssueFull, type: any} {
  return {
    type: types.ADD_CARD_TO_CELL,
    cellId,
    issue,
  };
}

export function reorderSwimlanesOrCells(leadingId: ?string, movedId: string): {leadingId: ?string, movedId: string, type: any} {
  return {
    type: types.REORDER_SWIMLANES_OR_CELLS,
    leadingId,
    movedId,
  };
}

export function addOrUpdateCellOnBoard(issue: IssueOnList, rowId: string, columnId: string): {columnId: string, issue: IssueOnList, rowId: string, type: any} {
  return {
    type: types.ADD_OR_UPDATE_CELL_ON_BOARD,
    issue,
    rowId,
    columnId,
  };
}

export function updateSwimlane(swimlane: AgileBoardRow): {swimlane: AgileBoardRow, type: any} {
  return {
    type: types.UPDATE_SWIMLANE,
    swimlane,
  };
}

export function storeCreatingIssueDraft(draftId: string, cellId: string): {cellId: string, draftId: string, type: any} {
  return {
    type: types.STORE_CREATING_ISSUE_DRAFT,
    draftId,
    cellId,
  };
}

export function createCardForCell(columnId: string, cellId: string): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();
    try {
      const draft = await api.agile.getIssueDraftForAgileCell(sprint.agile.id, sprint.id, columnId, cellId);
      dispatch(storeCreatingIssueDraft(draft.id, cellId));
      Router.CreateIssue({predefinedDraftId: draft.id});
      trackEvent('Open create card for cell');
    } catch (err) {
      notify('Could not create card', err);
    }
  };
}

export function subscribeServersideUpdates(): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const updateCache = (): void => {cacheSprint(getState().agile.sprint);};

    serverSideEventsInstance = new ServersideEvents(getApi().config.backendUrl);
    serverSideEventsInstance.subscribeAgileBoardUpdates(sprint.eventSourceTicket);

    serverSideEventsInstance.listenTo('error', () => {
      clearTimeout(serverSideEventsInstanceErrorTimer);

      serverSideEventsInstanceErrorTimer = setTimeout(() => {
        log.info('Reloading sprint and reconnecting to LiveUpdate...');
        if (Router.getCurrentRouteName() !== routeMap.AgileBoard) {
          destroySSE(); //TODO: remove after implementing lazy screens loading
        } else if (serverSideEventsInstanceErrorTimer && serverSideEventsInstance) {
          dispatch(loadSprintIssues(sprint));
        }
      }, RECONNECT_TIMEOUT);
    });

    serverSideEventsInstance.listenTo('sprintCellUpdate', data => {
      animateLayout();
      dispatch(addOrUpdateCellOnBoard(data.issue, data.row.id, data.column.id));
      updateCache();
    });

    serverSideEventsInstance.listenTo('sprintSwimlaneUpdate', data => {
      animateLayout();
      dispatch(updateSwimlane(data.swimlane));
      updateCache();
    });

    serverSideEventsInstance.listenTo('sprintIssueRemove', data => {
      animateLayout();
      dispatch(removeIssueFromBoard(data.removedIssue.id));
      updateCache();
    });

    serverSideEventsInstance.listenTo('sprintIssueHide', data => {
      animateLayout();
      dispatch(removeIssueFromBoard(data.removedIssue.id));
      updateCache();
    });

    serverSideEventsInstance.listenTo('sprintIssueMessage', function (data) {
      data.messages.forEach(msg => notify(msg));
    });

    serverSideEventsInstance.listenTo('sprintIssuesReorder', data => {
      animateLayout();
      data.reorders.forEach(function (reorder) {
        const leadingId = reorder.leading ? reorder.leading.id : null;
        dispatch(reorderSwimlanesOrCells(leadingId, reorder.moved.id));
      });
      updateCache();
    });

    setSSEInstance(serverSideEventsInstance);
  };
}

export function onCardDrop(data: { columnId: string, cellId: string, leadingId: ?string, movedId: string }): ((
  dispatch: (any) => any,
  getState: () => any,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();

    const issueOnBoard = findIssueOnBoard(getState().agile.sprint.board, data.movedId);
    if (!issueOnBoard) {
      log.warn('Cannot find dragged issue on board');
      return;
    }

    const currentIndex = issueOnBoard.cell.issues.indexOf(issueOnBoard.issue);
    const currentLeading = issueOnBoard.cell.issues[currentIndex - 1];
    if (
      issueOnBoard.cell.id === data.cellId &&
      currentLeading?.id === data.leadingId
    ) {
      log.info('Card dropped to original position');
      return;
    }

    try {
      log.info(`Applying issue move: movedId="${data.movedId}", cellId="${data.cellId}", leadingId="${data.leadingId || ''}"`);
      animateLayout();
      dispatch(moveIssue(data.movedId, data.cellId, data.leadingId));

      await api.agile.updateCardPosition(
        sprint.agile.id,
        sprint.id,
        data.columnId,
        data.cellId,
        data.leadingId,
        data.movedId
      );

      trackEvent('Card drop');
    } catch (err) {
      dispatch(moveIssue(data.movedId, issueOnBoard.cell.id, currentLeading?.id));
      log.warn('Could not move card', err);
    }
  };
}

export function refreshAgile(agileId: string, sprintId: string, query: string): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    log.info('Refresh agile with popup');
    flushStoragePart({agileQuery: query});
    dispatch(loadSprint(agileId, sprintId, query));
  };
}

export function reSubscribeSEE(): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    destroySSE();
    dispatch(subscribeServersideUpdates());
  };
}

export function storeLastQuery(query: string): (() => Promise<void>) {
  return async () => {
    if (!query) {
      return;
    }

    const updatedQueries = [query, ...(getStorageState().lastQueries || [])];
    const uniqueUpdatedQueries = Array.from(new Set(updatedQueries)).slice(0, MAX_STORED_QUERIES);

    flushStoragePart({lastQueries: uniqueUpdatedQueries});
  };
}

export function updateIssue(issueId: string, sprint?: SprintFull): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    const issue: IssueFull | null = await issueUpdater.loadIssue(issueId);

    dispatch({
      type: ISSUE_UPDATED,
      issue,
      onUpdate(board) {
        !!sprint && cacheSprint(Object.assign({}, sprint, {board}));
      },
    });
  };
}
