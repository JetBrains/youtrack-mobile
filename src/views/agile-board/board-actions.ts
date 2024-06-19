import * as types from './board-action-types';
import {findIssueOnBoard} from './board-updaters';
import * as issueUpdater from 'components/issue-actions/issue-updater';
import animation from 'components/animation/animation';
import log from 'components/log/log';
import Router from 'components/router/router';
import ServersideEvents from 'components/api/api__serverside-events';
import usage from 'components/usage/usage';
import {ANALYTICS_AGILE_PAGE} from 'components/analytics/analytics-ids';
import {DEFAULT_ERROR_MESSAGE} from 'components/error/error-messages';
import {
  flushStoragePart,
  getStorageState,
  MAX_STORED_QUERIES,
} from 'components/storage/storage';
import {getAssistSuggestions} from 'components/query-assist/query-assist-helper';
import {
  getGroupedSprints,
  getSprintAllIssues,
  updateSprintIssues,
} from './agile-board__helper';
import {i18n} from 'components/i18n/i18n';
import {isIOSPlatform, until} from 'util/util';
import {ISSUE_UPDATED} from '../issue/issue-action-types';
import {notFoundMessageData} from 'components/error/error-message-data';
import {notify, notifyError} from 'components/notification/notification';
import {routeMap} from 'app-routes';
import {setGlobalInProgress} from 'actions/app-actions';
import {sortAlphabetically} from 'components/search/sorting';

import type Api from 'components/api/api';
import type {
  AgileBoardRow,
  AgileUserProfile,
  Board,
  BoardColumn,
  BoardOnList,
  Sprint,
  SprintBase,
  SprintFull,
  Swimlane,
} from 'types/Agile';
import type {CustomError} from 'types/Error';
import type {IssueFull, IssueOnList} from 'types/Issue';
import {AppState} from 'reducers';
import {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

export const PAGE_SIZE = 15;
const RECONNECT_TIMEOUT = 60000;
let serverSideEventsInstance: ServersideEvents | null;
let serverSideEventsInstanceErrorTimer: number | undefined;
export const DEFAULT_ERROR_AGILE_WITH_INVALID_STATUS = {
  status: {
    valid: false,
    errors: [DEFAULT_ERROR_MESSAGE],
  },
};

function receiveSprint(sprint: Sprint | null) {
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

function track(msg: string, additionalParam?: string) {
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

function getLastVisitedSprint(
  boardId: string,
  visitedSprints: Sprint[] | null | undefined,
): Sprint | null | undefined {
  return (visitedSprints || []).find(
    (sprint: Sprint) => sprint.agile?.id === boardId,
  );
}

export function getAgileUserProfile(): ReduxAction<Promise<AgileUserProfile | {}>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    return getState()?.agile?.profile || {};
  };
}
export function loadAgileWithStatus(
  agileId: string,
): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
  ) => {
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    const cachedDefaultAgileBoard = getStorageState().agileDefaultBoard;

    if (cachedDefaultAgileBoard) {
      dispatch(receiveAgile(cachedDefaultAgileBoard));
    }

    if (!isOffline) {
      dispatch({
        type: types.START_LOADING_AGILE,
      });
      const agileWithStatus = await dispatch(loadAgile(agileId));
      dispatch({
        type: types.STOP_LOADING_AGILE,
      });
      flushStoragePart({agileDefaultBoard: agileWithStatus});

      if (!agileWithStatus.status!.valid) {
        dispatch(receiveSprint(null));
        dispatch(setGlobalInProgress(false));
      }
    }
  };
}
export function loadBoard(
  board: Board,
  query: string,
  refresh: boolean = false,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    destroySSE();
    dispatch(updateAgileUserProfileLastVisitedAgile(board.id));
    dispatch(loadAgileWithStatus(board.id));
    const agileUserProfile = await dispatch(getAgileUserProfile());
    const cachedAgileLastSprint = getStorageState().agileLastSprint;
    let sprint: SprintBase | null;

    if (!refresh && board.currentSprint) {
      sprint = board.currentSprint;
    } else {
      sprint = getLastVisitedSprint(board.id, agileUserProfile?.visitedSprints) ||
        (cachedAgileLastSprint?.agile?.id === board.id
          ? cachedAgileLastSprint
          : null);
    }

    if (!sprint) {
      sprint = (board.sprints || []).slice(-1)[0];
      trackError('Cannot find last visited sprint');
      log.info('Agile Actions: Last visited sprint is undefined. Use the last one of the current board.');
    }
    if (sprint?.id) {
      log.info(`Agile Actions: Loading Sprint`);
      dispatch(loadSprint(board.id, sprint.id, query));
    } else {
      dispatch(receiveSprint(null));
      dispatch(setError(new Error(notFoundMessageData.title) as CustomError));
    }
  };
}

function updateAgileUserProfile(requestBody: Record<string, any>): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const [error, profile] = await until(
      getApi().agile.updateAgileUserProfile(requestBody),
    );

    if (!error) {
      dispatch({
        type: types.RECEIVE_AGILE_PROFILE,
        profile,
      });
    }
  };
}

function updateAgileUserProfileLastVisitedSprint(sprintId: string): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(
      updateAgileUserProfile({
        visitedSprints: [
          {
            id: sprintId,
          },
        ],
      }),
    );
  };
}

function updateAgileUserProfileLastVisitedAgile(agileId: string): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(
      updateAgileUserProfile({
        defaultAgile: {
          id: agileId,
        },
      }),
    );
  };
}

function receiveAgile(agile: Board) {
  return {
    type: types.RECEIVE_AGILE,
    agile,
  };
}

export function loadAgile(
  agileId: string,
): ReduxAction<Promise<Partial<Board>>> {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const api: Api = getApi();

    try {
      const agileWithStatus: Board = await api.agile.getAgile(agileId);
      dispatch(receiveAgile(agileWithStatus));
      log.info(`Agile Actions: Loaded agile board status: ${agileWithStatus.status.valid}`);
      return agileWithStatus;
    } catch (error) {
      log.warn(`Agile Actions: Cannot load agile board status`, error);
      return DEFAULT_ERROR_AGILE_WITH_INVALID_STATUS;
    }
  };
}
export async function cacheSprint(sprint: Sprint): Promise<void> {
  flushStoragePart({
    agileLastSprint: sprint,
  });
}
export function suggestAgileQuery(
  query: string,
  caret: number,
): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const projects = getState().agile.profile?.defaultAgile.projects || [];
    const suggestions = await getAssistSuggestions(getApi(),query, caret, projects, 'Issue');
    dispatch({
      type: types.AGILE_SEARCH_SUGGESTS,
      suggestions,
    });
  };
}
export function loadSprint(
  agileId: string,
  sprintId: string,
  query: string,
): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const api: Api = getApi();
    dispatch(setError(null));
    dispatch(setGlobalInProgress(true));
    destroySSE();

    try {
      const sprint = await api.agile.getSprint(
        agileId,
        sprintId,
        PAGE_SIZE,
        0,
        query,
      );
      const state: AppState = getState();

      async function loadSEETicket(): Promise<string | null> {
        const [error, eventSourceTicket] = await until(
          api.agile.loadSprintSSETicket(
            sprint.agile?.id || state.agile.id,
            sprint.id,
            encodeURIComponent(getStorageState().agileQuery || ''),
          ),
        );
        return error ? null : eventSourceTicket;
      }

      if (sprint && !sprint.eventSourceTicket) {
        const eventSourceTicket: string | null = await loadSEETicket();

        if (eventSourceTicket) {
          sprint.eventSourceTicket = eventSourceTicket;
        }
      }

      if (!state?.agile?.sprint) {
        dispatch(receiveSprint(sprint));
      }

      dispatch(loadSprintIssues(sprint));
      dispatch(updateAgileUserProfileLastVisitedSprint(sprint.id));
      log.info(`Agile Actions: Sprint has been loaded`);
    } catch (e) {
      const message: string = 'Could not load requested sprint';
      const error: CustomError = (new Error(message) as any) as CustomError;
      error.error_description = 'Check that the sprint exists';
      dispatch(setError(error));
      dispatch(receiveSprint(null));
      trackError('Load sprint');
      log.info(message, e);
      dispatch(setGlobalInProgress(false));
    }
  };
}
export function loadSprintIssues(
  sprint: SprintFull,
): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const api: Api = getApi();
    dispatch(setGlobalInProgress(true));

    try {
      const allIssuesIds: Array<{
        id: string;
      }> = getSprintAllIssues(sprint);
      const sprintIssues: IssueFull[] = await api.agile.getAgileIssues(
        allIssuesIds,
      );
      const updatedSprint: Sprint = updateSprintIssues(sprint, sprintIssues);
      dispatch(receiveSprint(updatedSprint));
      animateLayout();
      cacheSprint(updatedSprint);
      dispatch(subscribeServersideUpdates());
    } catch (e) {
      const message: string = 'Could not load requested sprint issues';
      const error: CustomError = (new Error(message) as any) as CustomError;
      error.error_description = 'Check that the sprint exists';
      trackError('Load sprint');
      dispatch(setError(error));
      log.info(message, e);
    } finally {
      dispatch(setGlobalInProgress(false));
    }
  };
}
export function loadAgileProfile(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {

    try {
    const profile = await getApi().agile.getAgileUserProfile();
      dispatch({
        type: types.RECEIVE_AGILE_PROFILE,
        profile,
      });
    } catch (error) {
      dispatch(setError(error as CustomError));
    }
  };
}
export function loadDefaultAgileBoard(
  query: string,
  refresh: boolean,
): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
  ) => {
    dispatch(setError(null));
    const isOffline: boolean = getState().app?.networkState?.isConnected === false;
    const cachedAgileLastSprint: Sprint | null | undefined = getStorageState().agileLastSprint;
    dispatch(receiveSprint(cachedAgileLastSprint));

    if (isOffline && cachedAgileLastSprint) {
      return;
    }

    await dispatch(loadAgileProfile());
    const agileUserProfile = await dispatch(getAgileUserProfile());
    const board = agileUserProfile?.defaultAgile;
    if (board) {
      log.info('Agile Actions: Loading Default Agile board');
      await dispatch(loadBoard(board, query, refresh));
    } else {
      dispatch(receiveSprint(null));
      const error: CustomError & {
        noAgiles: boolean;
      } = new Error('No agile boards found') as any;
      error.error_description = 'Create an agile board first';
      error.noAgiles = true;
      dispatch(setError(error));
      trackError('Default board is unknown');
    }
  };
}

function startSwimlanesLoading() {
  return {
    type: types.START_SWIMLANES_LOADING,
  };
}

function stopSwimlanesLoading() {
  return {
    type: types.STOP_SWIMLANES_LOADING,
  };
}

function receiveSwimlanes(swimlanes: Swimlane) {
  return {
    type: types.RECEIVE_SWIMLANES,
    PAGE_SIZE,
    swimlanes,
  };
}

function setSSEInstance(sseInstance: ServersideEvents | null) {
  serverSideEventsInstance = sseInstance;
}

export function destroySSE() {
  if (serverSideEventsInstance) {
    log.info('Agile Actions: Force close SSE');
    clearTimeout(serverSideEventsInstanceErrorTimer);
    serverSideEventsInstanceErrorTimer = undefined;
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

function moveIssue(
  movedId: string,
  cellId: string,
  leadingId: string | null | undefined,
) {
  return {
    type: types.MOVE_ISSUE,
    movedId,
    cellId,
    leadingId,
  };
}

export function fetchMoreSwimlanes(
  query?: string,
): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const isOffline: boolean =
      getState().app?.networkState?.isConnected === false;
    const {sprint, noMoreSwimlanes, isLoadingMore} = getState().agile;

    if (!sprint || noMoreSwimlanes || isLoadingMore || isOffline) {
      return;
    }

    dispatch(startSwimlanesLoading());

    try {
      const api: Api = getApi();
      const swimlanes = await api.agile.getSwimlanes(
        sprint.agile.id,
        sprint.id,
        PAGE_SIZE,
        sprint.board.trimmedSwimlanes.length,
        query,
      );
      dispatch(receiveSwimlanes(swimlanes));
      log.info(`Agile Actions: More swimlanes are loaded`);
      trackEvent('Load more swimlanes');
    } catch (e) {
      notifyError(e);
    } finally {
      dispatch(stopSwimlanesLoading());
    }
  };
}

function updateRowCollapsedState(row: AgileBoardRow, newCollapsed: boolean) {
  animateLayout();
  return {
    type: types.ROW_COLLAPSE_TOGGLE,
    row,
    newCollapsed,
  };
}

export function rowCollapseToggle(
  row: AgileBoardRow,
): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();

    if (!sprint) {
      return;
    }

    const oldCollapsed = row.collapsed;
    dispatch(updateRowCollapsedState(row, !row.collapsed));
    const isOffline: boolean =
      getState().app?.networkState?.isConnected === false;

    if (isOffline) {
      return;
    }

    try {
      await api.agile.updateRowCollapsedState(sprint.agile.id, sprint.id, {
        ...row,
        collapsed: !row.collapsed,
      });
      log.info(
        `Agile Actions: Collapse state successfully updated for the row, new state is = ${oldCollapsed ? 'expanded' : 'collapsed'}`,
      );
      trackEvent('Toggle row collapsing');
    } catch (e) {
      dispatch(updateRowCollapsedState(row, oldCollapsed));
      notifyError(e);
    }
  };
}

function updateColumnCollapsedState(column: BoardColumn, newCollapsed: boolean) {
  animateLayout();
  return {
    type: types.COLUMN_COLLAPSE_TOGGLE,
    column,
    newCollapsed,
  };
}

export function columnCollapseToggle(
  column: BoardColumn,
): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
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
      log.info(
        `Agile Actions: Collapse state successfully updated for column, new state is ${oldCollapsed ? 'expanded' : 'collapsed'}`,
      );
      trackEvent('Toggle column collapsing');
    } catch (e) {
      dispatch(updateColumnCollapsedState(column, oldCollapsed));
      notifyError(e as CustomError);
    }
  };
}
export function closeSelect(): {
  type: any;
} {
  return {
    type: types.CLOSE_AGILE_SELECT,
  };
}
export function openSprintSelect(): ReduxAction {
  return (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();

    if (sprint) {
      trackEvent('Open sprint select');
      dispatch({
        type: types.OPEN_AGILE_SELECT,
        selectProps: {
          show: true,
          placeholder: i18n('Filter sprints by name'),
          dataSource: async () => {
            const sprints: Sprint[] = await api.agile.getSprintList(sprint.agile.id);
            return getGroupedSprints(sprints);
          },
          selectedItems: [sprint],
          getTitle: (sprint: Sprint) =>
            `${sprint.name} ${sprint.archived ? i18n('(archived)') : ''}`,
          onSelect: (selectedSprint: Sprint, query: string) => {
            dispatch(closeSelect());
            dispatch(loadSprint(sprint.agile.id, selectedSprint.id, query));
            trackEvent('Change sprint');
          },
        },
      });
    }
  };
}
export function openBoardSelect(): ReduxAction {
  return (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const api: Api = getApi();
    const {sprint, agile} = getState().agile;
    trackEvent('Open board select');
    dispatch(setError(null));
    dispatch({
      type: types.OPEN_AGILE_SELECT,
      selectProps: {
        agileSelector: true,
        hasStar: (board: BoardOnList) => board.favorite,
        onStar: (board: BoardOnList) => api.agile.toggleAgileBoardStar(board),
        placeholder: i18n('Filter boards by name'),
        dataSource: async (q: string = '') => {
          const [error, agileBoardsList] = await until(
            api.agile.getAgileBoardsList()
          ) as [CustomError | null, BoardOnList[]];
          if (error) {
            return [];
          }
          const groupedBoards: {
            favorites: { data: BoardOnList[], title: string },
            regular: { data: BoardOnList[], title: string }
          } = agileBoardsList.filter(
            (it: BoardOnList) => it.name.toLowerCase().indexOf(q.toLowerCase()) !== -1
          ).sort(sortAlphabetically).reduce(
            (
              akk: {
                favorites: { data: BoardOnList[], title: string };
                regular: { data: BoardOnList[], title: string };
              },
              board: BoardOnList,
            ) => {
              board.favorite ? akk.favorites.data.push(board) : akk.regular.data.push(board);
              return akk;
            },
            {
              favorites: {data: [], title: ' '},
              regular: {data: [], title: ' '},
            },
          );
          return [groupedBoards.favorites, groupedBoards.regular];
        },
        selectedItems: sprint ? [sprint.agile] : agile ? [agile] : [],
        onSelect: async (selectedBoard: BoardOnList, query: string = '') => {
          dispatch(closeSelect());
          dispatch(receiveSprint(null));
          dispatch(setGlobalInProgress(true));
          await flushStoragePart({
            agileQuery: null,
          });
          dispatch(loadBoard(selectedBoard, query));
          trackEvent('Change board');
        },
      },
    });
  };
}
export function addCardToCell(
  cellId: string,
  issue: IssueFull,
): {
  cellId: string;
  issue: IssueFull;
  type: any;
} {
  return {
    type: types.ADD_CARD_TO_CELL,
    cellId,
    issue,
  };
}
export function reorderSwimlanesOrCells(
  leadingId: string | null | undefined,
  movedId: string,
): {
  leadingId: string | null | undefined;
  movedId: string;
  type: any;
} {
  return {
    type: types.REORDER_SWIMLANES_OR_CELLS,
    leadingId,
    movedId,
  };
}
export function addOrUpdateCellOnBoard(
  issue: IssueOnList,
  rowId: string,
  columnId: string,
): {
  columnId: string;
  issue: IssueOnList;
  rowId: string;
  type: any;
} {
  return {
    type: types.ADD_OR_UPDATE_CELL_ON_BOARD,
    issue,
    rowId,
    columnId,
  };
}
export function updateSwimlane(
  swimlane: AgileBoardRow,
): {
  swimlane: AgileBoardRow;
  type: any;
} {
  return {
    type: types.UPDATE_SWIMLANE,
    swimlane,
  };
}
export function storeCreatingIssueDraft(
  draftId: string,
  cellId: string,
): {
  cellId: string;
  draftId: string;
  type: any;
} {
  return {
    type: types.STORE_CREATING_ISSUE_DRAFT,
    draftId,
    cellId,
  };
}
export function createCardForCell(
  columnId: string,
  cellId: string,
): ReduxAction<Promise<Partial<IssueOnList> | null>> {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();

    try {
      const draft: Partial<IssueOnList> = await api.agile.getIssueDraftForAgileCell(
        sprint.agile.id,
        sprint.id,
        columnId,
        cellId,
      );
      dispatch(storeCreatingIssueDraft(draft.id, cellId));
      trackEvent('Open create card for cell');
      return draft;
    } catch (err) {
      notifyError(err as CustomError);
      return null;
    }
  };
}
export function subscribeServersideUpdates(): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const {sprint} = getState().agile;

    const updateCache = (): void => {
      cacheSprint(sprint);
    };

    serverSideEventsInstance = new ServersideEvents(getApi().config.backendUrl);
    serverSideEventsInstance.subscribeAgileBoardUpdates(
      sprint.eventSourceTicket,
    );
    serverSideEventsInstance.listenTo('error', () => {
      clearTimeout(serverSideEventsInstanceErrorTimer);
      serverSideEventsInstanceErrorTimer = setTimeout(() => {
        log.info('Agile Actions: Reloading sprint and reconnecting to LiveUpdate...');

        if (Router.getCurrentRouteName() !== routeMap.AgileBoard) {
          destroySSE(); //TODO: remove after implementing lazy screens loading
        } else if (
          serverSideEventsInstanceErrorTimer &&
          serverSideEventsInstance
        ) {
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
export function onCardDrop(data: {
  columnId: string;
  cellId: string;
  leadingId: string | null | undefined;
  movedId: string;
}): ReduxAction {
  return async (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter,
  ) => {
    const {sprint} = getState().agile;
    const api: Api = getApi();
    const issueOnBoard = findIssueOnBoard(
      sprint.board,
      data.movedId,
    );

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
      log.info('Agile Actions: Card dropped to original position');
      return;
    }

    try {
      log.info(`Agile Actions: Applying card move`);
      animateLayout();
      dispatch(moveIssue(data.movedId, data.cellId, data.leadingId));
      await api.agile.updateCardPosition(
        sprint.agile.id,
        sprint.id,
        data.columnId,
        data.cellId,
        data.leadingId,
        data.movedId,
      );
      trackEvent('Card drop');
    } catch (err) {
      dispatch(
        moveIssue(data.movedId, issueOnBoard.cell.id, currentLeading?.id),
      );
      log.warn('Could not move card', err);
    }
  };
}
export function refreshAgile(
  agileId: string,
  sprintId: string,
  query: string,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    log.info('Agile Actions: Refresh agile with popup');
    flushStoragePart({
      agileQuery: query,
    });
    dispatch(loadSprint(agileId, sprintId, query));
  };
}
export function storeLastQuery(query: string): () => Promise<void> {
  return async () => {
    if (!query) {
      return;
    }

    const updatedQueries = [query, ...(getStorageState().lastQueries || [])];
    const uniqueUpdatedQueries = Array.from(new Set(updatedQueries)).slice(
      0,
      MAX_STORED_QUERIES,
    );
    flushStoragePart({
      lastQueries: uniqueUpdatedQueries,
    });
  };
}
export function updateIssue(
  issueId: string,
  sprint?: SprintFull,
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    const issue: IssueFull | null = await issueUpdater.loadIssue(issueId);
    dispatch({
      type: ISSUE_UPDATED,
      issue,

      onUpdate(board: Board) {
        !!sprint &&
          cacheSprint(
            Object.assign({}, sprint, {
              board,
            }),
          );
      },
    });
  };
}
