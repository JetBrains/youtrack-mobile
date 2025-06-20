import * as types from './board-action-types';
import {LOG_OUT, SET_PROGRESS} from 'actions/action-types';
import {ISSUE_CREATED} from '../create-issue/create-issue-action-types';
import {ISSUE_UPDATED} from '../issue/issue-action-types';
import {createReducer} from 'redux-create-reducer';
import {
  updateRowCollapsedState,
  addCardToBoard,
  updateCardOnBoard,
  removeIssueFromBoard,
  reorderEntitiesOnBoard,
  addOrUpdateCell,
  updateSwimlane,
  moveIssueOnBoard,
} from './board-updaters';
import type {
  SprintFull,
  AgileBoardRow,
  Board,
  AgileUserProfile,
} from 'types/Agile';
import type {IssueOnListExtended, IssueFull, TransformedSuggestion} from 'types/Issue';
import type {CustomError} from 'types/Error';
type BoardState = Board;
export type AgilePageState = {
  isLoading: boolean;
  isLoadingAgile: boolean;
  profile: AgileUserProfile | null;
  isSprintSelectOpen: boolean;
  creatingIssueDraftId: string | null | undefined;
  creatingIssueDraftCellId: string | null | undefined;
  sprint?: SprintFull;
  selectProps: Record<string, any>;
  agile: Board;
  error?: (CustomError & { noAgiles: boolean; }) | null;
  queryAssistSuggestions: TransformedSuggestion[];
  noMoreSwimlanes?: boolean;
};
const initialPageState: AgilePageState = {
  isLoading: false,
  isLoadingAgile: false,
  profile: null,
  isSprintSelectOpen: false,
  creatingIssueDraftId: null,
  creatingIssueDraftCellId: null,
  selectProps: null,
  sprint: null,
  agile: null,
  error: null,
  queryAssistSuggestions: [],
};
const boardReducer = createReducer(
  {},
  {
    [types.RECEIVE_SWIMLANES](
      state: BoardState,
      action: Record<string, any>,
    ): A {
      if (action?.swimlanes?.length <= 0) {
        return state;
      }

      const stateTrimmedSwimlanes = state.trimmedSwimlanes || [];
      let trimmedSwimlanes = [];

      if (stateTrimmedSwimlanes.length > 0) {
        trimmedSwimlanes = (action.swimlanes || []).reduce((list, it) => {
          if (stateTrimmedSwimlanes.some(s => s.id !== it.id)) {
            list.push(it);
          }

          return list;
        }, []);
      } else {
        trimmedSwimlanes = action.swimlanes;
      }

      return {
        ...state,
        trimmedSwimlanes: [...stateTrimmedSwimlanes, ...trimmedSwimlanes],
      };
    },

    [types.ROW_COLLAPSE_TOGGLE](
      state: BoardState,
      action: {
        row: AgileBoardRow;
        newCollapsed: boolean;
      },
    ): BoardState {
      return updateRowCollapsedState(state, action.row, action.newCollapsed);
    },

    [types.COLUMN_COLLAPSE_TOGGLE](
      state: BoardState,
      action: Record<string, any>,
    ): BoardState {
      return {
        ...state,
        columns: (state.columns || []).map(it => {
          return it === action.column
            ? {...action.column, collapsed: action.newCollapsed}
            : it;
        }),
      };
    },

    [types.ADD_CARD_TO_CELL](
      state: BoardState,
      action: {
        cellId: string;
        issue: IssueFull;
      },
    ): BoardState {
      return addCardToBoard(state, action.cellId, action.issue);
    },

    [types.STORE_CREATING_ISSUE_DRAFT](
      state: BoardState,
      action: {
        draftId: string;
        cellId: string;
      },
    ): BoardState {
      return {
        ...state,
        creatingIssueDraftId: action.draftId,
        creatingIssueDraftCellId: action.cellId,
      };
    },

    [ISSUE_CREATED]: (
      state: AgilePageState,
      action: {
        issue: IssueFull;
        preDefinedDraftId: string | null | undefined;
      },
    ): AgilePageState => {
      if (
        state.creatingIssueDraftId !== action.preDefinedDraftId ||
        !state.creatingIssueDraftCellId
      ) {
        return state;
      }

      return {
        ...addCardToBoard(state, state.creatingIssueDraftCellId, action.issue),
        creatingIssueDraftId: null,
        creatingIssueDraftCellId: null,
      };
    },

    [ISSUE_UPDATED](
      state: BoardState,
      action: {
        issue: IssueFull;
        onUpdate: (board: Board) => any;
      },
    ): BoardState {
      const updatedBoard: BoardState = updateCardOnBoard(state, action.issue);
      action.onUpdate && action.onUpdate(updatedBoard);
      return updatedBoard;
    },

    [types.REMOVE_ISSUE_FROM_BOARD](
      state: BoardState,
      action: {
        issueId: string;
      },
    ): BoardState {
      return removeIssueFromBoard(state, action.issueId);
    },

    [types.REORDER_SWIMLANES_OR_CELLS](
      state: BoardState,
      action: {
        leadingId: string | null | undefined;
        movedId: string;
      },
    ): BoardState {
      return reorderEntitiesOnBoard(state, action.leadingId, action.movedId);
    },

    [types.ADD_OR_UPDATE_CELL_ON_BOARD](
      state: BoardState,
      action: {
        issue: IssueOnListExtended;
        rowId: string;
        columnId: string;
      },
    ): BoardState {
      return addOrUpdateCell(
        state,
        action.issue,
        action.rowId,
        action.columnId,
      );
    },

    [types.UPDATE_SWIMLANE](
      state: BoardState,
      action: {
        swimlane: AgileBoardRow;
      },
    ): BoardState {
      return updateSwimlane(state, action.swimlane);
    },

    [types.MOVE_ISSUE](
      state: BoardState,
      action: {
        movedId: string;
        cellId: string;
        leadingId: string | null | undefined;
      },
    ): BoardState {
      return moveIssueOnBoard(
        state,
        action.movedId,
        action.cellId,
        action.leadingId,
      );
    },
  },
);
const agilePageReducer = createReducer(initialPageState, {
  [LOG_OUT](state: AgilePageState): AgilePageState {
    return initialPageState;
  },

  [types.RECEIVE_AGILE_PROFILE](
    state: AgilePageState,
    action: {
      profile: AgileUserProfile;
    },
  ): AgilePageState {
    return {...state, profile: action.profile};
  },

  [SET_PROGRESS](
    state: AgilePageState,
    action: {
      isInProgress: boolean;
    },
  ) {
    return {...state, isLoading: action.isInProgress};
  },

  [types.RECEIVE_SPRINT](state: AgilePageState, action: Record<string, any>) {
    return {...state, sprint: action.sprint};
  },

  [types.START_SWIMLANES_LOADING](state: AgilePageState) {
    return {...state, isLoadingMore: true};
  },

  [types.STOP_SWIMLANES_LOADING](state: AgilePageState) {
    return {...state, isLoadingMore: false};
  },

  [types.RECEIVE_SWIMLANES](
    state: AgilePageState,
    action: Record<string, any>,
  ): AgilePageState {
    return {
      ...state,
      noMoreSwimlanes: action.swimlanes.length < action.PAGE_SIZE,
    };
  },

  [types.OPEN_AGILE_SELECT](
    state: AgilePageState,
    action: Record<string, any>,
  ): AgilePageState {
    return {
      ...state,
      isSprintSelectOpen: true,
      selectProps: action.selectProps,
    };
  },

  [types.CLOSE_AGILE_SELECT](state: AgilePageState): AgilePageState {
    return {...state, selectProps: null, isSprintSelectOpen: false};
  },

  [types.START_LOADING_AGILE](state: AgilePageState): AgilePageState {
    return {...state, isLoadingAgile: true};
  },

  [types.STOP_LOADING_AGILE](state: AgilePageState): AgilePageState {
    return {...state, isLoadingAgile: false};
  },

  [types.RECEIVE_AGILE](
    state: AgilePageState,
    action: {
      agile: Board;
    },
  ): AgilePageState {
    return {...state, agile: {...state.agile, ...action.agile}};
  },

  [types.AGILE_ERROR](
    state: AgilePageState,
    action: {
      error: CustomError;
    },
  ): AgilePageState {
    return {...state, error: action.error};
  },

  [types.AGILE_SEARCH_SUGGESTS]: (
    state: AgilePageState,
    action: {
      suggestions: Array<Record<string, any>>;
    },
  ) => {
    return {...state, queryAssistSuggestions: action.suggestions};
  },
});
/**
 * We manually apply boardReducer only if sprint is loaded to simplify board updating
 */

export default function reducer(
  state: AgilePageState,
  action: Record<string, any>,
): AgilePageState {
  const newState = agilePageReducer(state, action);

  if (!newState.sprint) {
    return newState;
  }

  return {
    ...newState,
    sprint: {
      ...newState.sprint,
      board: boardReducer(newState.sprint.board, action),
    },
  };
}
