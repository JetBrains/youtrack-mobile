/* eslint-disable */

type SprintInformation = {
  id: string,
  name: string,
  goal: ?string,
  archived: boolean,
  start: ?number,
  finish: ?number
};

type AgileUserProfile = {
  defaultAgile: {
    id: string,
    name: string,
    sprints: Array<SprintInformation>
  },
  visitedSprints: Array<{
    id: string,
    agile: { id: string }
  }>
};

type AgileColumnFieldValue = {
  id: string,
  presentation: string,
};

type AgileColumn = {
  id: string,
  collapsed: boolean,
  isVisible: boolean,
  fieldValues: Array<AgileColumnFieldValue>
};

type BoardCell = {
  id: string,
  tooManyIssues: boolean,
  column: { id: string },
  issues: Array<IssueOnList>
};

type AgileBoardRow = {
  $type: string,
  id: string,
  name: string,
  collapsed: boolean,
  issue: IssueOnList,
  cells: Array<BoardCell>
};

type BoardColumn = {
  id: string,
  collapsed: boolean,
  agileColumn: AgileColumn
};

type Board = {
  id: string,
  name: string,
  columns: Array<BoardColumn>,
  orphanRow: AgileBoardRow,
  trimmedSwimlanes: Array<AgileBoardRow>
};

type SprintFull = SprintInformation & {
  board: Board,
  agile: {
    id: string,
    name: string,
    orphansAtTheTop: boolean
  }
};
