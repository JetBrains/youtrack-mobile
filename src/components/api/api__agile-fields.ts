import ApiHelper from './api__helper';
import issueFields from './api__issue-fields';
const toField = ApiHelper.toField;
const SPRINT: any = toField(['id', 'name', 'start', 'finish','favorite']);
const AGILE_SHORT_WITH_SPRINTS = toField([
  'id',
  'name',
  {
    sprints: SPRINT,
  },
  {
    currentSprint: SPRINT,
  },
  {
    projects: [
      'id',
    ],
  },
]);
const AGILE_PROFILE: any = toField([
  {
    defaultAgile: AGILE_SHORT_WITH_SPRINTS.toString(),
    visitedSprints: [
      'id',
      'name',
      {
        agile: 'id',
      },
    ],
  },
]);
const AGILE_COLUMN_FIELD_VALUE = toField(['presentation', 'id']);
const AGILE_COLUMN = toField([
  'id',
  'collapsed',
  'isVisible',
  {
    fieldValues: AGILE_COLUMN_FIELD_VALUE,
  },
]);
const BOARD_COLUMN = toField([
  'id',
  'collapsed',
  {
    agileColumn: AGILE_COLUMN,
  },
]);
const BOARD_ISSUE_BASE_FIELDS = toField(['id', 'idReadable', 'summary']);
const BOARD_ROW: any = toField([
  'id',
  'name',
  'collapsed',
  {
    issue: BOARD_ISSUE_BASE_FIELDS,
  },
  {
    cells: [
      'id',
      {
        column: 'id',
      },
      {
        issues: toField([
          BOARD_ISSUE_BASE_FIELDS,
          {
            fields: toField([
              '$type',
              'id',
              {
                value: ['id'],
              },
              {
                projectCustomField: [
                  {
                    field: ['id', 'name', 'localizedName'],
                  },
                ],
              },
            ]),
          },
        ]),
      },
    ],
  },
]);
const COLOR_CODING = toField([
  'id',
  'prototype(id,name)', //FieldBasedColorCoding
  'projectColors(id,color(id,background),project(id))', //ProjectBasedColorCoding
]);
const BOARD = toField([
  'id',
  'name',
  {
    columns: BOARD_COLUMN,
  },
  {
    orphanRow: BOARD_ROW,
  },
  {
    trimmedSwimlanes: BOARD_ROW,
  },
]);
const BOARD_ON_LIST: any = toField([
  'id',
  'name',
  'favorite',
  {
    sprints: ['id', 'name'],
  },
]);
const SPRINT_WITH_BOARD: any = toField([
  SPRINT,
  {
    board: BOARD,
  },
  'eventSourceTicket',
  {
    agile: [
      'id',
      'name',
      'orphansAtTheTop',
      'isUpdatable',
      {
        estimationField: 'id',
      },
      {
        colorCoding: COLOR_CODING,
      },
    ],
  },
]);
const SPRINT_LIVE_UPDATE: any = toField([
  {
    swimlane: BOARD_ROW,
  },
  {
    issue: issueFields.issuesOnList,
  },
  {
    removedIssue: 'id',
  },
  {
    updatedIssue: 'id',
  },
  {
    row: 'id',
  },
  {
    column: 'id',
  },
  'messages',
  {
    reorders: [
      {
        leading: 'id',
      },
      {
        moved: 'id',
      },
    ],
  },
  {
    changedIssue: ['id'],
  },
]);
const SPRINT_ISSUES_FIELDS: any = toField([
  'id',
  'resolved',
  {
    tags: issueFields.ISSUE_TAGS_FIELDS,
  },
  {
    project: 'id,name',
  },
  {
    fields: [
      'id',
      'name',
      {
        value: [
          'id',
          'name',
          'avatarUrl',
          'color(id,background)',
          'presentation',
        ],
      },
      {
        projectCustomField: [
          'id',
          {
            field: [
              'id',
              'name',
              {
                fieldType: ['isMultiValue'],
              },
            ],
          },
        ],
      },
    ],
  },
]);

const AGILE: any = toField([
  'id',
  'name',
  'favorite',
  'hideOrphansSwimlane',
  {
    status: ['errors', 'valid'],
  },
  {
    swimlaneSettings: ['$type', 'enabled'],
  },
  {
    sprintsSettings: ['disableSprints'],
  },
  {
    projects: issueFields.PROJECT_BASE_AND_HELPDESK_SETTINGS_FIELDS,
  },
]);


export default {
  agileUserProfile: AGILE_PROFILE,
  sprint: SPRINT_WITH_BOARD,
  sprintIssues: SPRINT_ISSUES_FIELDS,
  sprintShort: SPRINT,
  row: BOARD_ROW,
  boardOnList: BOARD_ON_LIST,
  liveUpdate: SPRINT_LIVE_UPDATE,
  AGILE,
};
