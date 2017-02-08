/* eslint-disable */

type SprintInformation = {
  id: string,
  name: string,
  goal: string,
  archived: boolean,
  start: number,
  finish: number,
  isDefault: boolean
};

type AgileUserProfile = {
  defaultAgile: {
    id: string,
    name: string,
    isUpdatable: boolean,
    status: {
      valid: boolean
    },
    sprints: Array<SprintInformation>
  },
  visitedSprints: Array<{
    id: string,
    agile: { id: string }
  }>
};

type AgileColumnFieldValue = {
  id: string,
  name: string,
  presentation: string,
  ordinal: number,
  isResolved: boolean,
  column: { id: string },
  canUpdate: boolean
};

type AgileColumn = {
  id: string,
  ordinal: number,
  color: { id: string },
  isResolved: boolean,
  collapsed: boolean,
  isVisible: boolean,
  wipLimit: { min: number, max: number },
  fieldValues: Array<AgileColumnFieldValue>
};

type BoardCell = {
  id: string,
  tooManyIssues: boolean,
  column: { id: string },
  issues: Array<IssueOnList>
};

type BoardRow = {
  id: string,
  name: string,
  issue: IssueOnList,
  cells: Array<BoardCell>
};

type BoardColumn = {
  id: string,
  collapsed: boolean,
  sumEstimation: number,
  sumSpentTime: number,
  agileColumn: AgileColumn
};

type Board = {
  id: string,
  name: string,
  notOnBoardCount: number,
  columns: Array<BoardColumn>,
  orphanRow: BoardRow,
  trimmedSwimlanes: Array<BoardRow>
};

type SprintFull = {
  id: string,
  name: string,
  goal: string,
  archived: boolean,
  start: number,
  finish: number,
  isDefault: boolean,


  board: Board,
  agile: {
    id: string,
    name: string,
    orphansAtTheTop: boolean
  }
};
