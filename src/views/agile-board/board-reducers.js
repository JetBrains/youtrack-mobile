/* @flow */
import * as types from './board-action-types';
import {createReducer} from 'redux-create-reducer';
import type {SprintFull, AgileBoardRow, Board} from '../../flow/Agile';
import type {IssueOnList, IssueFull} from '../../flow/Issue';
import type ServersideEvents from '../../components/api/api__serverside-events';

type BoardState = {
  isLoading: boolean,
  noBoardSelected: boolean,
  isSprintSelectOpen: boolean,
  sprint: ?SprintFull,
  selectProps: ?Object,
  serversideEvents: ?ServersideEvents
};

const initialState: BoardState = {
  isLoading: false,
  noBoardSelected: false,
  isSprintSelectOpen: false,
  selectProps: null,
  sprint: null,
  serversideEvents: null
};

function updateRowCollapsedState(
  board: Board,
  row: AgileBoardRow,
  collapsed: boolean
): Board {
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

function addCardToBoard(
  board: Board,
  cellId: string,
  issue: IssueFull
): Board {
  function addCardToRowIfNeeded(row) {
    const isTargetRow = row.cells.some(cell => cell.id === cellId);
    if (!isTargetRow) {
      return row;
    }
    return {
      ...row,
      cells: row.cells.map(cell => cell.id === cellId ? {...cell, issues: cell.issues.concat(issue)} : cell)
    };
  }

  return {
    ...board,
    orphanRow: addCardToRowIfNeeded(board.orphanRow),
    trimmedSwimlanes: board.trimmedSwimlanes.map(addCardToRowIfNeeded)
  };
}

function fillIssueFromAnotherIssue(issue: IssueOnList, sourceIssue: IssueFull) {
  return Object.keys(issue).
    reduce((updated, key) => {
      return {...updated, [key]: sourceIssue[key]};
    }, {});
}

function updateCardOnBoard(board: Board, sourceIssue: IssueFull): Board {
  function updateIssueInRowIfNeeded(row: AgileBoardRow) {
    return {
      ...row,
      issue: (row.issue && row.issue.id === sourceIssue.id) ? fillIssueFromAnotherIssue(row.issue, sourceIssue) : row.issue,
      cells: row.cells.
        map(cell => {
          if (cell.issues.some(issue => issue.id === sourceIssue.id)) {
            return {
              ...cell,
              issues: cell.issues.map(issue => issue.id === sourceIssue.id ? fillIssueFromAnotherIssue(issue, sourceIssue) : issue)
            };
          }
          return cell;
        })
    };
  }

  return {
    ...board,
    orphanRow: updateIssueInRowIfNeeded(board.orphanRow),
    trimmedSwimlanes: board.trimmedSwimlanes.map(updateIssueInRowIfNeeded)
  };
}

function removeSwimlaneFromBoard(board: Board, issueId: string): Board {
  return {
    ...board,
    trimmedSwimlanes: board.trimmedSwimlanes.filter((row: AgileBoardRow) => row.issue.id !== issueId)
  };
}

function removeCardFromBoard(board: Board, issueId: string): Board {
  const isSwimlane = board.trimmedSwimlanes.some(
    (row: AgileBoardRow) => row.issue.id === issueId
  );
  if (isSwimlane) {
    return removeSwimlaneFromBoard(board, issueId);
  }

  function removeIssueInRow(row: AgileBoardRow) {
    return {
      ...row,
      cells: row.cells.filter(cell => {
        if (cell.issues.some(issue => issue.id === issueId)) {
          return {
            ...cell,
            issues: cell.issues.filter(issue => issue.id !== issueId)
          };
        }
        return cell;
      })
    };
  }

  return {
    ...board,
    orphanRow: removeIssueInRow(board.orphanRow),
    trimmedSwimlanes: board.trimmedSwimlanes.map(removeIssueInRow)
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
  },
  [types.ADD_CARD_TO_CELL](state: BoardState, action: {cellId: string, issue: IssueFull}): BoardState {
    const {sprint} = state;
    if (!sprint) {
      return state;
    }
    return {
      ...state,
      sprint: {
        ...sprint,
        board: addCardToBoard(sprint.board, action.cellId, action.issue)
      }
    };
  },
  [types.UPDATE_ISSUE_ON_BOARD](state: BoardState, action: {cellId: string, issue: IssueFull}): BoardState {
    const {sprint} = state;
    if (!sprint) {
      return state;
    }
    return {
      ...state,
      sprint: {
        ...sprint,
        board: updateCardOnBoard(sprint.board, action.issue)
      }
    };
  },
  [types.STORE_EVENT_SOURCE](state: BoardState, action: {serversideEvents: Object}): BoardState {
    return {...state, serversideEvents: action.serversideEvents};
  },
  [types.DESTROY_EVENT_SOURCE](state: BoardState): BoardState {
    if (state.serversideEvents) {
      state.serversideEvents.close();
    }
    return {...state, serversideEvents: null};
  },
  [types.REMOVE_ISSUE_FROM_BOARD](state: BoardState, action: {issueId: string}): BoardState {
    const {sprint} = state;
    if (!sprint) {
      return state;
    }
    return {
      ...state,
      sprint: {
        ...sprint,
        board: removeCardFromBoard(sprint.board, action.issueId)
      }
    };
  }
});

export default board;
