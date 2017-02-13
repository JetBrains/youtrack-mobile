/* @flow */
import * as types from '../actions/actionTypes';
import type {SprintFull, AgileBoardRow, Board} from '../../../flow/Agile';

type BoardState = {
  isLoading: boolean,
  sprint: ?SprintFull
};

const initialState: BoardState = {
  isLoading: false,
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

export default function board(state: BoardState = initialState, action: Object = {}): BoardState {
  switch (action.type) {
    case types.INITIALIZE_API:
      return {
        ...state,
        api: action.api,
        auth: action.auth
      };
    case types.START_SPRINT_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case types.STOP_SPRINT_LOADING:
      return {
        ...state,
        isLoading: false
      };
    case types.RECEIVE_SPRINT:
      return {
        ...state,
        sprint: action.sprint
      };
    case types.START_SWIMLANES_LOADING:
      return {
        ...state,
        isLoadingMore: true
      };
    case types.STOP_SWIMLANES_LOADING:
      return {
        ...state,
        isLoadingMore: false
      };
    case types.RECEIVE_SWIMLANES:
      return {
        ...state,
        sprint: {
          ...state.sprint,
          board: {
            ...state.sprint.board,
            trimmedSwimlanes: state.sprint.board.trimmedSwimlanes.concat(action.swimlanes)
          }
        },
        noMoreSwimlanes: action.swimlanes.length < action.PAGE_SIZE
      };
    case types.ROW_COLLAPSE_TOGGLE: {
      return {
        ...state,
        sprint: {
          ...state.sprint,
          board: updateRowCollapsedState(state.sprint.board, action.row, action.newCollapsed)
        }
      };
    }
    default:
      return state;
  }
}
