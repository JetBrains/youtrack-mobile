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
      'name',
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

const BOARD_ISSUE_BASE_FIELDS = toField([
  'id',
  'idReadable',
]);

const BOARD_ROW = toField([
  'id',
  'name',
  'collapsed',
  {issue: BOARD_ISSUE_BASE_FIELDS},
  {
    cells: [
      'id',
      'tooManyIssues',
      {column: 'id'},
      {
        issues: toField([
          BOARD_ISSUE_BASE_FIELDS,
          {
            fields: toField([
              '$type',
              'id',
              {
                value: [
                  'id',
                ]
              },
              {
                projectCustomField: [
                  {
                    field: [
                      'id',
                      'name'
                    ]
                  }
                ]
              }
            ])
          },
          {tags: IssueFields.ISSUE_TAGS_FIELDS}
        ])
      }
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
  'favorite',
  {sprints: ['id', 'name']}
]);

const SPRINT_WITH_BOARD = toField([
  SPRINT,
  {board: BOARD},
  'eventSourceTicket',
  {
    agile: [
      'id',
      'name',
      'orphansAtTheTop',
      'isUpdatable',
      {estimationField: 'id'}
    ]
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

const SPRINT_ISSUES_FIELDS = 'id,idReadable,summary,resolved,tags(name,id,query,color(id,background,foreground)),fields($type,id,name,projectCustomField($type,field(fieldType(isMultiValue,valueType),id,localizedName,name),id,isSpentTime),value($type,archived,avatarUrl,color(id,background),id,isResolved,localizedName,login,name,presentation,ringId,text))';


export default {
  agileUserProfile: AGILE_PROFILE,
  sprint: SPRINT_WITH_BOARD,
  sprintIssues: SPRINT_ISSUES_FIELDS,
  sprintShort: SPRINT,
  row: BOARD_ROW,
  boardOnList: BOARD_ON_LIST,
  liveUpdate: SPRINT_LIVE_UPDATE
};
