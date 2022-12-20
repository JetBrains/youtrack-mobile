import type {IssueFull, IssueOnList} from './Issue';
export type Cell = {
  id: string;
  column: AgileColumn;
  issues: Array<IssueOnList>;
};
export type Swimlane = Record<string, any> & {
  issue: IssueFull;
  cells: Array<Cell>;
};
export type AgileUserProfile = {
  defaultAgile: Partial<Board>;
  visitedSprints: Array<{
    id: string;
    name: string;
    agile: {
      id: string;
    };
  }>;
};
export type AgileColumnFieldValue = {
  id: string;
  presentation: string;
};
export type AgileColumn = {
  id: string;
  collapsed: boolean;
  isVisible: boolean;
  fieldValues: Array<AgileColumnFieldValue>;
};
export type BoardCell = {
  id: string;
  tooManyIssues: boolean;
  column: {
    id: string;
  };
  issues: Array<IssueOnList>;
};
export type AgileBoardRow = {
  $type: string;
  id: string;
  name: string;
  collapsed: boolean;
  issue: IssueOnList;
  cells: Array<BoardCell>;
};
export type BoardColumn = {
  id: string;
  collapsed: boolean;
  agileColumn: AgileColumn;
};
export type FieldStyle = {
  $type?: string;
  id: string;
  background?: string;
};
export type ProjectColor = {
  id: string;
  color: {
    id: string;
  };
  project: {
    id: string;
  };
};
type FieldBasedColorCoding = {
  id: string;
  prototype: {
    id: string;
    name: string;
  };
};
type ProjectBasedColorCoding = FieldBasedColorCoding & {
  projectColors: Array<ProjectColor>;
};
export type Board = {
  favorite: boolean;
  id: string;
  name: string;
  columns: Array<BoardColumn>;
  orphanRow: AgileBoardRow;
  trimmedSwimlanes: Array<AgileBoardRow>;
  sprints: Array<Sprint>;
  status: {
    valid: boolean;
    errors?: Array<string>;
  };
  sprintsSettings: {
    disableSprints: boolean;
  };
  hideOrphansSwimlane: boolean;
  currentSprint: Partial<Sprint>;
  colorCoding: FieldBasedColorCoding | ProjectBasedColorCoding;
};
export type BoardOnList = {
  id: string;
  name: string;
  sprints: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    fullName: string;
  };
};
export type Sprint = {
  id: string;
  name: string;
  goal: string | null | undefined;
  archived: boolean;
  start: number | null | undefined;
  finish: number | null | undefined;
  agile?: Board;
  board?: Board;
};
export type SprintFull = Sprint & {
  id: string;
  board: Board;
  eventSourceTicket: string;
  agile: {
    id: string;
    name: string;
    orphansAtTheTop: boolean;
    isUpdatable: boolean;
    estimationField: {
      id: string;
    };
  };
};