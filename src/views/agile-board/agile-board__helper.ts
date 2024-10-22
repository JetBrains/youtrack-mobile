import {ResourceTypes} from 'components/api/api__resource-types';
import {
  BoardCell,
  BoardColumn,
  Cell,
  FieldBasedColorCoding,
  FieldStyle,
  ProjectColor,
  Sprint,
  SprintBase,
  SprintFull,
  SprintIssue,
  Swimlane,
} from 'types/Agile';

type GroupedSprints = {
  active: Sprint[];
  archived: Sprint[];
};

function sprintComparator(sprint1: Sprint, sprint2: Sprint) {
  const first = asDate(sprint1);
  const second = asDate(sprint2);

  if (first === second) {
    return sprint2.name.localeCompare(sprint1.name);
  }

  return second - first;

  function asDate(sprint: SprintBase) {
    if (!sprint.finish && !sprint.start) {
      return 0;
    }

    return sprint.finish ? sprint.finish : Number.MAX_SAFE_INTEGER;
  }
}

export function getGroupedSprints(sprints: Sprint[]): Sprint[] {
  const groupedSprints: GroupedSprints = sprints.reduce(
    (group: {archived: Sprint[]; active: Sprint[]}, sprint) => {
      group[sprint.archived ? 'archived' : 'active'].push(sprint);
      return group;
    },
    {
      active: [],
      archived: [],
    }
  );
  return new Array<Sprint>()
    .concat(groupedSprints.active.sort(sprintComparator))
    .concat(groupedSprints.archived.sort(sprintComparator));
}

export function isAllColumnsCollapsed(columns: BoardColumn[] = []): boolean {
  return !columns.some((column: BoardColumn) => !column.collapsed);
}

export const getSprintAllIssues = (sprint: SprintFull): Array<{id: string}> => {
  const trimmedSwimlanes = sprint.board?.trimmedSwimlanes || [];
  const trimmedSwimlanesCells = trimmedSwimlanes.reduce(
    (cells: BoardCell[], swimlane) => cells.concat(swimlane.cells),
    []
  );
  const orphanCells = sprint.board?.orphanRow?.cells || [];
  const cellsIssues = orphanCells
    .concat(trimmedSwimlanesCells)
    .reduce((list: SprintIssue[], cell: BoardCell) => list.concat(cell.issues), []);
  const swimlaneIssues = trimmedSwimlanes.map((swimlane: Record<string, any>) => swimlane.issue).filter(Boolean);
  return cellsIssues.concat(swimlaneIssues).map((issue: SprintIssue) => ({
    id: issue.id,
  }));
};

export function updateSprintIssues(sprint: SprintFull, sprintIssues: SprintIssue[]): SprintFull {
  const sprintIssuesMap = sprintIssues.reduce((map: {[id: string]: SprintIssue}, issue: SprintIssue) => {
    map[issue.id] = issue;
    return map;
  }, {});
  const updatedSprint: SprintFull = Object.assign({}, sprint);
  (updatedSprint.board?.orphanRow?.cells || []).forEach(updateCellIssues);
  (updatedSprint.board?.trimmedSwimlanes || []).forEach(
    (swimlane: Swimlane, index: number, targetArray: Swimlane[]) => {
      if (swimlane.issue && sprintIssuesMap[swimlane.issue.id]) {
        targetArray[index].issue = {
          ...targetArray[index].issue,
          ...sprintIssuesMap[swimlane.issue.id],
        };
      }

      swimlane.cells.forEach(updateCellIssues);
    }
  );
  return updatedSprint;

  function updateCellIssues(cell: Cell) {
    cell.issues.forEach((issue: SprintIssue, index: number, targetArray: SprintIssue[]) => {
      if (sprintIssuesMap[issue.id]) {
        targetArray[index] = {...issue, ...sprintIssuesMap[issue.id]};
      }
    });
  }
}

function issueFieldIsInstanceOf(issueField, field) {
  function issueFieldValueToProjectCustomField(issueFieldValue) {
    return issueFieldValue.projectCustomField || {};
  }

  if (!field) {
    return false;
  }

  const issueFieldsValueProjectCF = issueFieldValueToProjectCustomField(issueField);

  if (field.id === issueFieldsValueProjectCF.id) {
    return true;
  }

  return issueFieldsValueProjectCF.field && field.id === issueFieldsValueProjectCF.field.id;
}

const DEFAULT_COLOR_CODING: FieldStyle = {
  id: '0',
};

function fieldBaseColorCodingToColorId(issue: SprintIssue, colorCoding: FieldBasedColorCoding): FieldStyle {
  const colorCodingIssueField = (issue.fields || []).find(function (fieldValue) {
    return issueFieldIsInstanceOf(fieldValue, colorCoding.prototype);
  });
  const colorCodingIssueFieldValue = colorCodingIssueField && colorCodingIssueField.value;

  if (!colorCodingIssueFieldValue) {
    return DEFAULT_COLOR_CODING;
  }

  const color: FieldStyle | null | undefined = colorCodingIssueFieldValue[0]
    ? colorCodingIssueFieldValue[0].color
    : colorCodingIssueFieldValue.color;
  return color || DEFAULT_COLOR_CODING;
}

function projectBasedColorCodingToColorId(issue: SprintIssue, colorCoding): FieldStyle {
  if (!Array.isArray(colorCoding.projectColors) || !issue.project) {
    return DEFAULT_COLOR_CODING;
  }

  const projectColor: ProjectColor | undefined = colorCoding.projectColors.find(
    (prjColor: ProjectColor) => prjColor.id === issue.project.id
  );
  return projectColor?.color || DEFAULT_COLOR_CODING;
}

export function getAgileCardColorCoding(issue: SprintIssue, agileBoardColorCoding: FieldBasedColorCoding): FieldStyle {
  if (!issue || !agileBoardColorCoding) {
    return DEFAULT_COLOR_CODING;
  }

  if (agileBoardColorCoding.$type === ResourceTypes.FIELD_BASED_COLOR_CODING) {
    return fieldBaseColorCodingToColorId(issue, agileBoardColorCoding);
  }

  if (agileBoardColorCoding.$type === ResourceTypes.PROJECT_BASED_COLOR_CODING) {
    return projectBasedColorCodingToColorId(issue, agileBoardColorCoding);
  }

  return DEFAULT_COLOR_CODING;
}

export function hasColorCoding(colorCoding: FieldStyle) {
  return colorCoding.id !== DEFAULT_COLOR_CODING.id;
}
