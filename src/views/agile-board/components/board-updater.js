
export function updateRowCollapsedState(
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
