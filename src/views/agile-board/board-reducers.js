/* @flow */
import * as types from './board-action-types';
import {LOG_OUT} from '../../actions/action-types';
import {ISSUE_CREATED} from '../create-issue/create-issue-action-types';
import {ISSUE_UPDATED} from '../single-issue/single-issue-action-types';
import {createReducer} from 'redux-create-reducer';
import type {SprintFull, BoardCell, AgileBoardRow, Board} from '../../flow/Agile';
import type {IssueOnList, IssueFull} from '../../flow/Issue';
import type ServersideEvents from '../../components/api/api__serverside-events';

type BoardState = Board;

export type AgilePageState = {
  isLoading: boolean,
  noBoardSelected: boolean,
  isSprintSelectOpen: boolean,
  creatingIssueDraftId: ?string,
  creatingIssueDraftCellId: ?string,
  sprint: ?SprintFull,
  selectProps: ?Object,
  serversideEvents: ?ServersideEvents
};

const initialPageState: AgilePageState = {
  isLoading: false,
  noBoardSelected: false,
  isSprintSelectOpen: false,
  creatingIssueDraftId: null,
  creatingIssueDraftCellId: null,
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

function updateCellsIssuesIfNeeded(
  cells: Array<BoardCell>,
  issueId: string,
  updateIssues: (Array<IssueOnList>) => Array<IssueOnList>
) {
  const isTargetIssueHere = cells.some(cell => cell.issues.some(issue => issue.id === issueId));
  if (!isTargetIssueHere) {
    return cells;
  }

  return cells.map(cell => {
    if (cell.issues.some(issue => issue.id === issueId)) {
      return {
        ...cell,
        issues: updateIssues(cell.issues)
      };
    }
    return cell;
  });
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

function findIssueOnBoard(board: Board, issueId: string) {
  const rows = [...board.trimmedSwimlanes, board.orphanRow];

  for (const rowIndex in rows) {
    const row = rows[rowIndex];
    for (const cellIndex in row.cells) {
      const cell = row.cells[cellIndex];
      const foundIssue = cell.issues.filter(issue => issue.id === issueId)[0];

      if (foundIssue) {
        return {
          cell: cell,
          row: row,
          issue: foundIssue,
          column: board.columns[cellIndex]
        };
      }
    }
  }
}

function removeAllSwimlaneCardsFromBoard(board: Board, swimlane: AgileBoardRow) {
  return swimlane.cells.reduce((processingBoard: Board, cell: BoardCell) => {
    cell.issues.forEach(issue => {
      processingBoard = removeIssueFromBoard(processingBoard, issue.id);
    });

    return processingBoard;
  }, board);
}

function updateCardOnBoard(board: Board, sourceIssue: IssueFull): Board {
  function updateIssueInRowIfNeeded(row: AgileBoardRow) {
    return {
      ...row,
      issue: row.issue && row.issue.id === sourceIssue.id ? fillIssueFromAnotherIssue(row.issue, sourceIssue) : row.issue,
      cells: updateCellsIssuesIfNeeded(row.cells, sourceIssue.id, issues =>
        issues.map(
          issue => issue.id === sourceIssue.id ? fillIssueFromAnotherIssue(issue, sourceIssue) : issue
        ))
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

function removeIssueFromBoard(board: Board, issueId: string): Board {
  const isSwimlane = board.trimmedSwimlanes.some(
    (row: AgileBoardRow) => row.issue.id === issueId
  );
  if (isSwimlane) {
    return removeSwimlaneFromBoard(board, issueId);
  }

  function removeIssueInRow(row: AgileBoardRow) {
    return {
      ...row,
      cells: updateCellsIssuesIfNeeded(row.cells, issueId, issues => issues.filter(issue => issue.id !== issueId))
    };
  }

  return {
    ...board,
    orphanRow: removeIssueInRow(board.orphanRow),
    trimmedSwimlanes: board.trimmedSwimlanes.map(removeIssueInRow)
  };
}

function reorderCollection(colection: Array<{id: string}>, leadingId: ?string, movedId: string) {
  const moved = colection.filter(s => s.id === movedId)[0];
  const updated = colection.filter(s => s !== moved);
  const leadingIndex = updated.findIndex(s => s.id === leadingId);
  updated.splice(leadingIndex + 1, 0, moved);
  return updated;
}

function reorderCardsInRow(row: AgileBoardRow, leadingId: ?string, movedId: string) {
  return {
    ...row,
    cells: updateCellsIssuesIfNeeded(row.cells, movedId, issues => reorderCollection(issues, leadingId, movedId))
  };
}

function reorderEntitiesOnBoard(board: Board, leadingId: ?string, movedId: string) {
  const isSwimlane = board.trimmedSwimlanes.some(
    (row: AgileBoardRow) => row.issue.id === movedId
  );

  if (isSwimlane) {
    return {...board, trimmedSwimlanes: reorderCollection(board.trimmedSwimlanes, leadingId, movedId)};
  }

  return {
    ...board,
    orphanRow: reorderCardsInRow(board.orphanRow, leadingId, movedId),
    trimmedSwimlanes: board.trimmedSwimlanes.map(row => reorderCardsInRow(row, leadingId, movedId))
  };
}

function addOrUpdateCell(board: Board, issue: IssueOnList, rowId, columnId) {
  board = removeSwimlaneFromBoard(board, issue.id); // Swimlane could be turn into card

  const targetRow = [board.orphanRow, ...board.trimmedSwimlanes].filter(row => row.id === rowId)[0];
  if (!targetRow) {
    return board;
  }
  const targetCell = targetRow.cells.filter((cell: BoardCell) => cell.column.id === columnId)[0];

  const issueOnBoard = findIssueOnBoard(board, issue.id);

  if (!issueOnBoard) {
    return addCardToBoard(board, targetCell.id, issue);
  }

  const inSameCell = issueOnBoard.cell.column.id === columnId && issueOnBoard.row.id === rowId;
  if (inSameCell) {
    return updateCardOnBoard(board, issue);
  }

  board = removeIssueFromBoard(board, issue.id);
  return addCardToBoard(board, targetCell.id, issue);
}

function updateSwimlane(board: Board, swimlane: AgileBoardRow) {
  const swimlaneToUpdate = board.trimmedSwimlanes.filter(row => row.id === swimlane.id)[0];

  if (swimlaneToUpdate) {
    if (!swimlaneToUpdate.cells) { // It is new if no cells
      removeAllSwimlaneCardsFromBoard(board, swimlane);
    }
    return {
      ...board,
      trimmedSwimlanes: board.trimmedSwimlanes.map(row => row.id === swimlane.id ? swimlane : row)
    };
  } else {
    removeIssueFromBoard(board, swimlane.issue.id); // Card could be turn info swimlane
    removeAllSwimlaneCardsFromBoard(board, swimlane); // Swimlane was added to board
    return {
      ...board,
      trimmedSwimlanes: [...board.trimmedSwimlanes, swimlane]
    };
  }
}

const boardReducer = createReducer({}, {
  [types.RECEIVE_SWIMLANES](state: BoardState, action: Object): BoardState {
    return {
      ...state,
      trimmedSwimlanes: [...state.trimmedSwimlanes, ...action.swimlanes]
    };
  },
  [types.ROW_COLLAPSE_TOGGLE](state: BoardState, action: {row: AgileBoardRow, newCollapsed: boolean}): BoardState {
    return updateRowCollapsedState(state, action.row, action.newCollapsed);
  },
  [types.COLUMN_COLLAPSE_TOGGLE](state: BoardState, action: Object): BoardState {
    return {
      ...state,
      columns: state.columns.map(it => {
        return it === action.column ? {...action.column, collapsed: action.newCollapsed} : it;
      })
    };
  },
  [types.ADD_CARD_TO_CELL](state: BoardState, action: {cellId: string, issue: IssueFull}): BoardState {
    return addCardToBoard(state, action.cellId, action.issue);
  },
  [types.STORE_CREATING_ISSUE_DRAFT](state: BoardState, action: {draftId: string, cellId: string}): BoardState {
    return {...state, creatingIssueDraftId: action.draftId, creatingIssueDraftCellId: action.cellId};
  },
  [ISSUE_CREATED]: (state: AgilePageState, action: {issue: IssueFull, preDefinedDraftId: ?string}): AgilePageState => {
    if (state.creatingIssueDraftId !== action.preDefinedDraftId || !state.creatingIssueDraftCellId) {
      return state;
    }
    return {
      ...addCardToBoard(state, state.creatingIssueDraftCellId, action.issue),
      creatingIssueDraftId: null,
      creatingIssueDraftCellId: null
    };
  },
  [ISSUE_UPDATED](state: BoardState, action: {issue: IssueFull}): BoardState {
    return updateCardOnBoard(state, action.issue);
  },
  [types.REMOVE_ISSUE_FROM_BOARD](state: BoardState, action: {issueId: string}): BoardState {
    return removeIssueFromBoard(state, action.issueId);
  },
  [types.REORDER_SWIMLANES_OR_CELLS](state: BoardState, action: {leadingId: ?string, movedId: string}): BoardState {
    return reorderEntitiesOnBoard(state, action.leadingId, action.movedId);
  },
  [types.ADD_OR_UPDATE_CELL_ON_BOARD](state: BoardState, action: {issue: IssueOnList, rowId: string, columnId: string}): BoardState {
    return addOrUpdateCell(state, action.issue, action.rowId, action.columnId);
  },
  [types.UPDATE_SWIMLANE](state: BoardState, action: {swimlane: AgileBoardRow}): BoardState {
    return updateSwimlane(state, action.swimlane);
  }
});


const agilePageReducer = createReducer(initialPageState, {
  [LOG_OUT](state: AgilePageState): AgilePageState {
    return initialPageState;
  },
  [types.NO_AGILE_SELECTED](state: AgilePageState) {
    return {...state, noBoardSelected: true};
  },
  [types.START_SPRINT_LOADING](state: AgilePageState) {
    return {...state, noBoardSelected: false, isLoading: true};
  },
  [types.STOP_SPRINT_LOADING](state: AgilePageState) {
    return {...state, isLoading: false};
  },
  [types.RECEIVE_SPRINT](state: AgilePageState, action: Object) {
    return {...state,sprint: action.sprint};
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
  }
});

/**
 * We manyally apply boardReducer only if sptint is loaded to simplify board updating
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
