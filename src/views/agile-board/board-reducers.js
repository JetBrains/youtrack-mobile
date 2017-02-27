/* @flow */
import * as types from './board-action-types';
import {createReducer} from 'redux-create-reducer';
import type {SprintFull, AgileBoardRow, Board} from '../../flow/Agile';

type BoardState = {
  isLoading: boolean,
  noBoardSelected: boolean,
  isSprintSelectOpen: boolean,
  sprint: ?SprintFull,
  selectProps: ?Object,
};

const initialState: BoardState = {
  isLoading: false,
  noBoardSelected: false,
  isSprintSelectOpen: false,
  selectProps: null,
  sprint: null
};

function updateRowCollapsedState(
  board: Board,
  row: AgileBoardRow,
  collapsed: boolean
): SprintFull {
  const isOrphan = row.id === 'orphans';
  const trimmedSwimlanes = board.trimmedSwimlanes;

  return {
      ...board,
      trimmedSwimlanes: isOrphan ? trimmedSwimlanes : trimmedSwimlanes.map(swimlane => {
        return swimlane.id === row.id ? {...row, collapsed} : swimlane;
      }),
      orphanRow: isOrphan ? {...board.orphanRow, collapsed} : board.orphanRow
  };
}

const board = createReducer(initialState, {
  [types.NO_AGILE_SELECTED](state: BoardState) {
    return {
      ...state,
      noBoardSelected: true
    };
  },
  [types.START_SPRINT_LOADING](state: BoardState) {
    return {
      ...state,
      noBoardSelected: false,
      isLoading: true
    };
  },
  [types.STOP_SPRINT_LOADING](state: BoardState) {
    return {
      ...state,
      isLoading: false
    };
  },
  [types.RECEIVE_SPRINT](state: BoardState, action: Object) {
    return {
      ...state,
      sprint: action.sprint
    };
  },
  [types.START_SWIMLANES_LOADING](state: BoardState) {
    return {
      ...state,
      isLoadingMore: true
    };
  },
  [types.STOP_SWIMLANES_LOADING](state: BoardState) {
    return {
      ...state,
      isLoadingMore: false
    };
  },
  [types.RECEIVE_SWIMLANES](state:BoardState, action: Object): BoardState {
    const {sprint} = state;
    if (!sprint) {
      return state;
    }
    return {
      ...state,
      sprint: {
        ...sprint,
        board: {
          ...sprint.board,
          trimmedSwimlanes: sprint.board.trimmedSwimlanes.concat(action.swimlanes)
        }
      },
      noMoreSwimlanes: action.swimlanes.length < action.PAGE_SIZE
    };
  },
  [types.ROW_COLLAPSE_TOGGLE](state: BoardState, action: Object): BoardState {
    const {sprint} = state;
    if (!sprint) {
      return state;
    }
    return {
      ...state,
      sprint: {
        ...sprint,
        board: updateRowCollapsedState(sprint.board, action.row, action.newCollapsed)
      }
    };
  },
  [types.COLUMN_COLLAPSE_TOGGLE](state: BoardState, action: Object): BoardState {
    const {sprint} = state;
    if (!sprint) {
      return state;
    }
    return {
      ...state,
      sprint: {
        ...sprint,
        board: {
          ...sprint.board,
          columns: sprint.board.columns.map(it => {
            return it === action.column ? {...action.column, collapsed: action.newCollapsed} : it;
          })
        }
      }
    };
  },
  [types.OPEN_AGILE_SELECT](state: BoardState, action: Object): BoardState {
    return {
      ...state,
      isSprintSelectOpen: true,
      selectProps: action.selectProps
    };
  },
  [types.CLOSE_AGILE_SELECT](state: BoardState): BoardState {
    return {
      ...state,
      selectProps: null,
      isSprintSelectOpen: false
    };
  }
});

export default board;
