import type {IssueFull, IssueOnList} from './Issue';
import {ProjectWithPlugins} from 'types/Project';

export type Cell = {
  id: string;
  column: AgileColumn;
  issues: IssueOnList[];
};
export type Swimlane = Record<string, any> & {
  issue: IssueFull;
  cells: Cell[];
};
export type AgileUserProfile = {
  defaultAgile: {
    id: string;
    name: string;
    currentSprint: SprintBase;
    sprints: SprintBase[];
    projects: Array<{
      id: string;
      ringId: string;
    }>
  };
  visitedSprints: {
    id: string;
    name: string;
    agile: {
      id: string;
    };
  }[];
};
export type AgileColumnFieldValue = {
  id: string;
  presentation: string;
};
export type AgileColumn = {
  id: string;
  collapsed: boolean;
  isVisible: boolean;
  fieldValues: AgileColumnFieldValue[];
};
export type BoardCell = {
  id: string;
  tooManyIssues: boolean;
  column: {
    id: string;
  };
  issues: IssueOnList[];
};
export type AgileBoardRow = {
  $type: string;
  id: string;
  name: string;
  collapsed: boolean;
  issue: IssueOnList;
  cells: BoardCell[];
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
  projectColors: ProjectColor[];
};
export type Board = {
  favorite: boolean;
  id: string;
  name: string;
  columns: BoardColumn[];
  orphanRow: AgileBoardRow;
  trimmedSwimlanes: AgileBoardRow[];
  sprints: Sprint[];
  status: {
    valid: boolean;
    errors?: string[];
  };
  sprintsSettings: {
    disableSprints: boolean;
  };
  hideOrphansSwimlane: boolean;
  currentSprint: SprintBase;
  colorCoding: FieldBasedColorCoding | ProjectBasedColorCoding;
  projects: Array<ProjectWithPlugins>;
  swimlaneSettings: {
    $type: string;
    enabled: boolean;
  };
};
export type BoardOnList = {
  $type: string;
  id: string;
  name: string;
  favorite: boolean;
  sprints: {
    id: string;
    name: string;
  };
  creator: {
    id: string;
    fullName: string;
  };
};

export interface Agile {
  $type: string;
  id: string;
  name: string;
  hideOrphansSwimlane: boolean;
  isUpdatable: boolean;
  orphansAtTheTop: boolean;
  estimationField: {
    id: string;
  };
  colorCoding: FieldBasedColorCoding | ProjectBasedColorCoding;
}

export interface SprintBase {
  id: string;
  name: string;
  start: number | null;
  finish: number | null;
}

export interface Sprint extends SprintBase {
  archived: boolean;
  agile?: Agile;
  board?: Board;
  goal: string | null;
}

export interface SprintFull extends Sprint {
  id: string;
  board: Board;
  agile: Agile;
  eventSourceTicket: string;
}
