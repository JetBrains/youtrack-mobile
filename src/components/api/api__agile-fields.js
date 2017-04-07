/* @flow */
import ApiHelper from './api__helper';
import IssueFields from './api__issue-fields';

const toField = ApiHelper.toField;

const SPRINT = toField([
  'id',
  'name',
  'goal',
  'archived',
  'start',
  'finish'
]);

const AGILE_SHORT_WITH_SPRINTS = toField([
  'id',
  'name',
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
  'id',
]);

const AGILE_COLUMN = toField([
  'id',
  'collapsed',
  'isVisible',
  {
    fieldValues: AGILE_COLUMN_FIELD_VALUE
  }
]);

const BOARD_COLUMN = toField([
  'id',
  'collapsed',
  {
    agileColumn: AGILE_COLUMN
  }
]);

const BOARD_ROW = toField([
  '$type',
  'id',
  'name',
  'collapsed',
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
  {
    columns: BOARD_COLUMN
  },
  {
    orphanRow: BOARD_ROW
  },
  {trimmedSwimlanes: BOARD_ROW}
]);

const BOARD_ON_LIST = toField([
  'id',
  'name',
  {sprints: ['id', 'name']},
  {creator: ['id', 'fullName']}
]);

const SPRINT_WITH_BOARD = toField([
  SPRINT,
  { board: BOARD },
  'eventSourceTicket',
  {
    agile: ['id', 'name', 'orphansAtTheTop']
  }
]);

const SPRINT_LIVE_UPDATE = toField([
  {swimlane: BOARD_ROW},
  {issue: IssueFields.issuesOnList},
  {removedIssue: 'id'},
  {updatedIssue: 'id'},
  {row: 'id'},
  {column: 'id'},
  'messages',
  {reorders: [{leading: 'id'}, {moved: 'id'}]},
  {
    changedIssue: ['id']
  }
]);


export default {
  agileUserProfile: AGILE_PROFILE,
  sprint: SPRINT_WITH_BOARD,
  sprintShort: SPRINT,
  row: BOARD_ROW,
  boardOnList: BOARD_ON_LIST,
  liveUpdate: SPRINT_LIVE_UPDATE
};
