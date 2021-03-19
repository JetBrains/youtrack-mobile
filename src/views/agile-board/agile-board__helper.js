/* @flow */

import type {BoardColumn, Cell, Sprint, SprintFull, Swimlane} from '../../flow/Agile';
import type {IssueFull, IssueOnList} from '../../flow/Issue';

type GroupedSprints = {
  active: Array<Sprint>,
  archived: Array<Sprint>
}

function sprintComparator(sprint1: Sprint, sprint2: Sprint) {
  const first = asDate(sprint1);
  const second = asDate(sprint2);

  if (first === second) {
    return sprint2.name.localeCompare(sprint1.name);
  }
  return second - first;

  function asDate(sprint) {
    if (!sprint.finish && !sprint.start) {
      return 0;
    }
    return sprint.finish ? sprint.finish : Number.MAX_SAFE_INTEGER;
  }
}


export function getGroupedSprints(sprints: Array<Sprint>): Array<Sprint> {
  const groupedSprints: GroupedSprints = sprints.reduce(
    (group, sprint) => {
      group[sprint.archived ? 'archived' : 'active'].push(sprint);
      return group;
    },
    {
      active: [],
      archived: [],
    }
  );

  return [].concat(
    groupedSprints.active.sort(sprintComparator)
  ).concat(
    groupedSprints.archived.sort(sprintComparator)
  );
}

export function isAllColumnsCollapsed(columns: Array<BoardColumn> = []) {
  return !columns.some((column: BoardColumn) => !column.collapsed);
}

export const getSprintAllIssues = (sprint: SprintFull) => {
  const trimmedSwimlanes = sprint.board?.trimmedSwimlanes || [];
  const trimmedSwimlanesCells = trimmedSwimlanes.reduce(
    (cells: Array<Object>, swimlane: Object) => cells.concat(swimlane.cells), []
  );
  const orphanCells = sprint.board?.orphanRow?.cells || [];
  const cellsIssues = orphanCells.concat(trimmedSwimlanesCells).reduce(
    (list: Array<IssueOnList>, cell: Object) => list.concat(cell.issues),
    []
  );
  const swimlaneIssues = trimmedSwimlanes.map((swimlane: Object) => swimlane.issue).filter(Boolean);
  return cellsIssues.concat(swimlaneIssues).map((issue: IssueOnList) => ({id: issue.id}));
};

export function updateSprintIssues(sprint: SprintFull, sprintIssues: Array<{ id: string }>): SprintFull {
  const sprintIssuesMap: { key: string, value: IssueFull } = sprintIssues.reduce((map: Object, issue: IssueFull) => {
    map[issue.id] = issue;
    return map;
  }, {});

  const updatedSprint: SprintFull = Object.assign({}, sprint);

  (updatedSprint.board?.orphanRow?.cells || []).forEach(updateCellIssues);

  (updatedSprint.board?.trimmedSwimlanes || []).forEach(
    (swimlane: Swimlane, index: number, targetArray: Array<Swimlane>) => {
      if (swimlane.issue && sprintIssuesMap[swimlane.issue.id]) {
        targetArray[index].issue = {...targetArray[index].issue, ...sprintIssuesMap[swimlane.issue.id]};
      }
      swimlane.cells.forEach(updateCellIssues);
    });

  return updatedSprint;

  function updateCellIssues(cell: Cell) {
    cell.issues.forEach((issue: IssueOnList, index: number, targetArray: Array<IssueFull>) => {
      if (sprintIssuesMap[issue.id]) {
        targetArray[index] = {...issue, ...sprintIssuesMap[issue.id]};
      }
    });
  }
}
