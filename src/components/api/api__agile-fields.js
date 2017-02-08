/* @flow */
import ApiHelper from './api__helper';
import IssueFields from './api__fields';

const toField = ApiHelper.toField;

const SPRINT = toField([
  'id',
  'name',
  'goal',
  'archived',
  'start',
  'finish',
  'isDefault'
]);

const AGILE_SHORT_WITH_SPRINTS = toField([
  'id',
  'name',
  'isUpdatable',
  {
    status: ['valid']
  },
  {
    sprints: SPRINT
  }
]);

const AGILE_PROFILE = toField([
  {
    defaultAgile: AGILE_SHORT_WITH_SPRINTS.toString(),
    visitedSprints: [
      'id',
      {
        agile: 'id'
      }
    ]
  }
]);

const AGILE_COLUMN_FIELD_VALUE = toField([
  'presentation',
  'ordinal',
  'isResolved',
  'name',
  'id',
  'column(id)',
  'canUpdate'
]);

const AGILE_COLUMN = toField([
  'id',
  'ordinal',
  'color(id)',
  'isResolved',
  'collapsed',
  'isVisible',
  'wipLimit(min,max)',
  {
    fieldValues: AGILE_COLUMN_FIELD_VALUE
  }
]);

const BOARD_COLUMN = toField([
  'id',
  'collapsed',
  'sumEstimation',
  'sumSpentTime',
  {
    agileColumn: AGILE_COLUMN
  }
]);

const BOARD_ROW = toField([
  'id',
  'name',
  { issue: IssueFields.issuesOnList },
  {
    cells: [
      'id',
      'tooManyIssues',
      { column: 'id' },
      { issues: IssueFields.issuesOnList }
    ]
  }
]);

const BOARD = toField([
  'id',
  'name',
  'notOnBoardCount',
  {
    columns: BOARD_COLUMN
  },
  {
    orphanRow: BOARD_ROW
  },
  {trimmedSwimlanes: BOARD_ROW}
]);

const SPRINT_WITH_BOARD = toField([
  SPRINT,
  { board: BOARD },
  {
    agile: ['id', 'name', 'orphansAtTheTop']
  }
]);


export default {
  agileUserProfile: AGILE_PROFILE,
  sprint: SPRINT_WITH_BOARD
};
