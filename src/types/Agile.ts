import type {EntityBase} from 'types/Entity.ts';
import type {ICustomField, Tag} from 'types/CustomFields';
import type {IssueFull, IssueOnListExtended, IssueOnListFieldValue} from './Issue';
import type {ProjectWithPlugins} from 'types/Project';

export interface Cell {
  id: string;
  column: AgileColumn;
  issues: IssueOnListExtended[];
}

export interface Swimlane {
  issue: IssueFull;
  cells: Cell[];
}

export interface AgileUserProfile {
  defaultAgile: {
    id: string;
    name: string;
    currentSprint: SprintBase;
    sprints: SprintBase[];
    projects: Array<{
      id: string;
      ringId: string;
    }>;
  };
  visitedSprints: {
    id: string;
    name: string;
    agile: {
      id: string;
    };
  }[];
}

export interface AgileColumnFieldValue {
  id: string;
  presentation: string;
}

export interface AgileColumn {
  id: string;
  collapsed: boolean;
  isVisible: boolean;
  fieldValues: AgileColumnFieldValue[];
}

export interface BoardCell {
  id: string;
  tooManyIssues: boolean;
  column: {
    id: string;
  };
  issues: IssueOnListExtended[];
}

export interface AgileBoardRow extends EntityBase {
  name: string;
  collapsed: boolean;
  issue: IssueOnListExtended;
  cells: BoardCell[];
}

export interface BoardColumn {
  id: string;
  collapsed: boolean;
  agileColumn: AgileColumn;
}

export interface FieldStyle {
  id: string;
  background?: string;
}

export interface ProjectColor {
  id: string;
  color: {
    id: string;
  };
  project: {
    id: string;
  };
}

export interface FieldBasedColorCoding extends EntityBase {
  prototype: EntityBase & {
    name: string;
  };
}

type ProjectBasedColorCoding = FieldBasedColorCoding & {
  projectColors: ProjectColor[];
};

export interface Board {
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
}

export interface BoardOnList extends EntityBase {
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
}

export interface BoardOnIssue extends EntityBase {
  name: string;
  projects: Array<{
    id: string
  }>,
  sprintsSettings: {
    disableSprints: boolean;
  };
}

export interface SprintOnIssue extends EntityBase {
  name: string;
  agile: {
    id: string;
  }
}

export interface Agile extends EntityBase {
  name: string;
  hideOrphansSwimlane: boolean;
  isUpdatable: boolean;
  orphansAtTheTop: boolean;
  estimationField: {
    id: string;
  };
  colorCoding: FieldBasedColorCoding | ProjectBasedColorCoding;
}

export interface SprintBase extends EntityBase {
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
  agile: Agile;
  board: Board;
  eventSourceTicket: string;
}

export interface SprintIssue extends EntityBase {
  resolved: boolean;
  tags: Tag[];
  project: {
    $type: string;
    id: string;
    name: string;
  };
  fields: Array<{
    $type: string;
    id: string;
    name: string;
    projectCustomField: {
      $type: string;
      id: string;
      field: Omit<ICustomField, 'localizedName'>;
    };
    value: Omit<IssueOnListFieldValue, 'localizedName'> | null | [];
  }>;
}
