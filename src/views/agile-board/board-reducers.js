/* @flow */
import * as types from './board-action-types';
import {LOG_OUT} from '../../actions/action-types';
import {ISSUE_CREATED} from '../create-issue/create-issue-action-types';
import {ISSUE_UPDATED} from '../single-issue/single-issue-action-types';
import {createReducer} from 'redux-create-reducer';
import {
  updateRowCollapsedState,
  addCardToBoard,
  updateCardOnBoard,
  removeIssueFromBoard,
  reorderEntitiesOnBoard,
  addOrUpdateCell,
  updateSwimlane,
  moveIssueOnBoard
} from './board-updaters';

import type {SprintFull, AgileBoardRow, Board, AgileUserProfile} from '../../flow/Agile';
import type {IssueOnList, IssueFull} from '../../flow/Issue';
import type ServersideEvents from '../../components/api/api__serverside-events';

type BoardState = Board;

export type AgilePageState = {
  isLoading: boolean,
  profile: ?AgileUserProfile,
  noBoardSelected: boolean,
  isSprintSelectOpen: boolean,
  isOutOfDate: boolean,
  creatingIssueDraftId: ?string,
  creatingIssueDraftCellId: ?string,
  sprint: ?SprintFull,
  selectProps: ?Object,
  serversideEvents: ?ServersideEvents,
  agile: ?Board
};

const initialPageState: AgilePageState = {
  isLoading: false,
  profile: null,
  noBoardSelected: false,
  isSprintSelectOpen: false,
  isOutOfDate: false,
  creatingIssueDraftId: null,
  creatingIssueDraftCellId: null,
  selectProps: null,
  sprint: null,
  serversideEvents: null,
  agile: null
};

const boardReducer = createReducer({}, {
  [types.RECEIVE_SWIMLANES](state: BoardState, action: Object): BoardState {
    return {
      ...state,
      trimmedSwimlanes: [...state.trimmedSwimlanes, ...action.swimlanes]
    };
  },
  [types.ROW_COLLAPSE_TOGGLE](state: BoardState, action: { row: AgileBoardRow, newCollapsed: boolean }): BoardState {
    return updateRowCollapsedState(state, action.row, action.newCollapsed);
  },
  [types.COLUMN_COLLAPSE_TOGGLE](state: BoardState, action: Object): BoardState {
    return {
      ...state,
      columns: (state.columns || []).map(it => {
        return it === action.column ? {...action.column, collapsed: action.newCollapsed} : it;
      })
    };
  },
  [types.ADD_CARD_TO_CELL](state: BoardState, action: { cellId: string, issue: IssueFull }): BoardState {
    return addCardToBoard(state, action.cellId, action.issue);
  },
  [types.STORE_CREATING_ISSUE_DRAFT](state: BoardState, action: { draftId: string, cellId: string }): BoardState {
    return {...state, creatingIssueDraftId: action.draftId, creatingIssueDraftCellId: action.cellId};
  },
  [ISSUE_CREATED]: (state: AgilePageState, action: { issue: IssueFull, preDefinedDraftId: ?string }): AgilePageState => {
    if (state.creatingIssueDraftId !== action.preDefinedDraftId || !state.creatingIssueDraftCellId) {
      return state;
    }
    return {
      ...addCardToBoard(state, state.creatingIssueDraftCellId, action.issue),
      creatingIssueDraftId: null,
      creatingIssueDraftCellId: null
    };
  },
  [ISSUE_UPDATED](state: BoardState, action: { issue: IssueFull }): BoardState {
    return updateCardOnBoard(state, action.issue);
  },
  [types.REMOVE_ISSUE_FROM_BOARD](state: BoardState, action: { issueId: string }): BoardState {
    return removeIssueFromBoard(state, action.issueId);
  },
  [types.REORDER_SWIMLANES_OR_CELLS](state: BoardState, action: { leadingId: ?string, movedId: string }): BoardState {
    return reorderEntitiesOnBoard(state, action.leadingId, action.movedId);
  },
  [types.ADD_OR_UPDATE_CELL_ON_BOARD](state: BoardState, action: { issue: IssueOnList, rowId: string, columnId: string }): BoardState {
    return addOrUpdateCell(state, action.issue, action.rowId, action.columnId);
  },
  [types.UPDATE_SWIMLANE](state: BoardState, action: { swimlane: AgileBoardRow }): BoardState {
    return updateSwimlane(state, action.swimlane);
  },
  [types.MOVE_ISSUE](state: BoardState, action: { movedId: string, cellId: string, leadingId: ?string }): BoardState {
    return moveIssueOnBoard(state, action.movedId, action.cellId, action.leadingId);
  }
});


const agilePageReducer = createReducer(initialPageState, {
  [LOG_OUT](state: AgilePageState): AgilePageState {
    return initialPageState;
  },
  [types.RECEIVE_AGILE_PROFILE](state: AgilePageState, action: { profile: AgileUserProfile }): AgilePageState {
    return {...state, profile: action.profile};
  },
  [types.NO_AGILE_SELECTED](state: AgilePageState, action: Object) {
    return {...state, noBoardSelected: action.noBoardSelected};
  },
  [types.START_SPRINT_LOADING](state: AgilePageState) {
    return {...state, noBoardSelected: false, isLoading: true};
  },
  [types.STOP_SPRINT_LOADING](state: AgilePageState) {
    return {...state, isLoading: false};
  },
  [types.RECEIVE_SPRINT](state: AgilePageState, action: Object) {
    return {...state, sprint: action.sprint};
  },
  [types.START_SWIMLANES_LOADING](state: AgilePageState) {
    return {...state, isLoadingMore: true};
  },
  [types.STOP_SWIMLANES_LOADING](state: AgilePageState) {
    return {...state, isLoadingMore: false};
  },
  [types.RECEIVE_SWIMLANES](state: AgilePageState, action: Object): AgilePageState {
    return {
      ...state,
      noMoreSwimlanes: action.swimlanes.length < action.PAGE_SIZE
    };
  },
  [types.OPEN_AGILE_SELECT](state: AgilePageState, action: Object): AgilePageState {
    return {
      ...state,
      isSprintSelectOpen: true,
      selectProps: action.selectProps
    };
  },
  [types.CLOSE_AGILE_SELECT](state: AgilePageState): AgilePageState {
    return {
      ...state,
      selectProps: null,
      isSprintSelectOpen: false
    };
  },
  [types.IS_OUT_OF_DATE](state: AgilePageState, action: { isOutOfDate: boolean }): AgilePageState {
    return {
      ...state,
      isOutOfDate: action.isOutOfDate
    };
  },
  [types.RECEIVE_AGILE](state: AgilePageState, action: { agile: Board }): AgilePageState {
    return {
      ...state,
      agile: {
        ...state.agile,
        ...action.agile
      }
    };
  },
});

/**
 * We manually apply boardReducer only if sprint is loaded to simplify board updating
 */
export default function reducer(state: AgilePageState, action: Object): AgilePageState {
  const newState = agilePageReducer(state, action);
  if (!newState.sprint) {
    return newState;
  }
  return {
    ...newState,
    sprint: {
      ...newState.sprint,
      board: boardReducer(newState.sprint.board, action)
    }
  };
}
