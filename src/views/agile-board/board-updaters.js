/* @flow */
import log from '../../components/log/log';

import type {BoardCell, AgileBoardRow, Board, AgileColumn} from '../../flow/Agile';
import type {IssueOnList, IssueFull} from '../../flow/Issue';
import {notify} from '../../components/notification/notification';

export function updateRowCollapsedState(
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

  return cells.map((cell: BoardCell) => {
    if (cell.issues.some((issue: IssueOnList) => issue.id === issueId)) {
      return {
        ...cell,
        issues: updateIssues(cell.issues)
      };
    }
    return cell;
  });
}

export function addCardToBoard(
  board: Board,
  cellId: string,
  issue: IssueFull
): Board {
  const issueOnBoard = findIssueOnBoard(board, issue.id);
  if (issueOnBoard) {
    return updateCardOnBoard(board, issue);
  }

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

export function findIssueOnBoard(board: Board, issueId: string): ?{cell: BoardCell, row: AgileBoardRow, issue: IssueOnList, column: AgileColumn} {
  const rows = [...board.trimmedSwimlanes, board.orphanRow];

  // eslint-disable-next-line no-unused-vars
  for (const rowIndex in rows) {
    const row = rows[rowIndex];
    // eslint-disable-next-line no-unused-vars
    for (const cellIndex in row.cells) {
      const cell = row.cells[cellIndex];
      const foundIssue = cell.issues.filter(issue => issue.id === issueId)[0];

      if (foundIssue) {
        return {
          cell: cell,
          row: row,
          issue: foundIssue,
          column: (board.columns || [])[cellIndex]
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

export function updateCardOnBoard(board: Board, sourceIssue: IssueFull): Board {
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

function removeSwimlaneFromBoard(board: Board, rowId: string): Board {
  return {
    ...board,
    trimmedSwimlanes: board.trimmedSwimlanes.filter((row: AgileBoardRow) => row.id !== rowId)
  };
}

export function removeIssueFromBoard(board: Board, issueId: string): Board {
  const isSwimlane = board.trimmedSwimlanes.some(
    (row: AgileBoardRow) => row.issue && row.issue.id === issueId
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

export function reorderEntitiesOnBoard(board: Board, leadingId: ?string, movedId: string) {
  const isSwimlane = board.trimmedSwimlanes.some(
    (row: AgileBoardRow) => row.id === movedId
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

export function addOrUpdateCell(board: Board, issue: IssueOnList, rowId: string, columnId: string) {
  board = removeSwimlaneFromBoard(board, issue.id); // Swimlane could be turn into card

  const targetRow = [board.orphanRow, ...board.trimmedSwimlanes].filter(row => row.id === rowId)[0];
  if (!targetRow) {
    return board;
  }

  const targetCell = targetRow.cells.filter((cell: BoardCell) => cell.column.id === columnId)[0];
  if (!targetCell) {
    notify(`Agile board settings have been changed. Reload the board.`);
    return {
      ...board,
      orphanRow: board.orphanRow,
      trimmedSwimlanes: board.trimmedSwimlanes
    };
  }

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

export function updateSwimlane(board: Board, swimlane: AgileBoardRow) {
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

export function moveIssueOnBoard(board: Board, movedId: string, cellId: string, leadingId: ?string) {
  const issueOnBoard = findIssueOnBoard(board, movedId);
  if (!issueOnBoard) {
    log.debug('Cannot find moved issue on board');
    return;
  }
  const boardWithoutMoved = removeIssueFromBoard(board, movedId);
  const boardWithMovedInProperCell = addCardToBoard(boardWithoutMoved, cellId, issueOnBoard.issue);
  return reorderEntitiesOnBoard(boardWithMovedInProperCell, leadingId, movedId);
}
