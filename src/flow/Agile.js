/* @flow */


import type {IssueFull, IssueOnList} from './Issue';

export type Cell = {
  id: string,
  column: AgileColumn,
  issues: Array<IssueOnList>
};
export type Swimlane = Object & {
  issue: IssueFull,
  cells: Array<Cell>
};

export type AgileUserProfile = {
  defaultAgile: {
    id: string,
    name: string,
    sprints: Array<Sprint>
  },
  visitedSprints: Array<{
    id: string,
    name: string,
    agile: { id: string }
  }>
};

export type AgileColumnFieldValue = {
  id: string,
  presentation: string,
};

export type AgileColumn = {
  id: string,
  collapsed: boolean,
  isVisible: boolean,
  fieldValues: Array<AgileColumnFieldValue>
};

export type BoardCell = {
  id: string,
  tooManyIssues: boolean,
  column: { id: string },
  issues: Array<IssueOnList>
};

export type AgileBoardRow = {
  $type: string,
  id: string,
  name: string,
  collapsed: boolean,
  issue: IssueOnList,
  cells: Array<BoardCell>
};

export type BoardColumn = {
  id: string,
  collapsed: boolean,
  agileColumn: AgileColumn
};

export type Board = {
  id: string,
  name: string,
  columns: Array<BoardColumn>,
  orphanRow: AgileBoardRow,
  trimmedSwimlanes: Array<AgileBoardRow>,
  sprints: Array<Sprint>,
  status: {
    valid: boolean,
    errors?: Array<string>
  },
  sprintsSettings: {
    disableSprints: boolean,
  },
  hideOrphansSwimlane: boolean,
};

export type BoardOnList = {
  id: string,
  name: string,
  sprints: {id: string, name: string},
  creator: {id: string, fullName: string}
}

export type Sprint = {
  id: string,
  name: string,
  goal: ?string,
  archived: boolean,
  start: ?number,
  finish: ?number,
  agile: ?Board,
  board: ?Board,
};

export type SprintFull = Sprint & {
  id: string,
  board: Board,
  eventSourceTicket: string,
  agile: {
    id: string,
    name: string,
    orphansAtTheTop: boolean,
    isUpdatable: boolean,
    estimationField: {id: string}
  }
};
