import {toField} from './api__helper';

const ISSUE_PROJECT_FIELDS = toField([
  '$type',
  'id',
  'shortName',
  'ringId'
]);

const ISSUE_USER_FIELDS = toField([
  '$type',
  'login',
  'id',
  'ringId',
  'name'
]);

const ISSUE_FIELD_VALUE = toField(
  {
    'value': [
      '$type',
      'id',
      'name',
      'localizedName',
      'ringId',
      'login',
      'minutes',
      'presentation',
      'isResolved',

      {
        'color': [
          'id'
        ]
      }

    ]
  }
);

const ISSUE_FIELD_FIELDS = toField([
  '$type',
  'id',
  'name',
  'hasStateMachine',

  ISSUE_FIELD_VALUE,

  {
    'projectCustomField': [
      '$type',
      'id',
      'ordinal',
      'canBeEmpty',
      'emptyFieldText',
      {
        'bundle': [
          'id',
          'isUpdateable'
        ]
      },

      {
        'field': [
          'id',
          'name',
          'ordinal',
          'localizedName',
          'isPublic',

          {
            'fieldType': [
              'valueType',
              'isMultiValue'
            ]
          }
        ]
      }
    ]
  }
]);

const ISSUE_ATTACHMENTS_FIELDS = toField([
  '$type',
  'id'
]);

const ISSUE_COMMENTS_FIELDS = toField([
  'id',
  'text',
  {author: ISSUE_USER_FIELDS}
]);

export default {
  issuesOnList: toField([
    'id',
    'summary',
    'resolved',
    {project: ISSUE_PROJECT_FIELDS},
    'numberInProject',
    {reporter: ISSUE_USER_FIELDS},
    {fields: ISSUE_FIELD_FIELDS}
  ]),
  singleIssue: toField([
    'id',
    'summary',
    'resolved',
    {project: ISSUE_PROJECT_FIELDS},
    'numberInProject',
    {reporter: ISSUE_USER_FIELDS},
    {fields: ISSUE_FIELD_FIELDS},
    {attachments: ISSUE_ATTACHMENTS_FIELDS},
    {comments: ISSUE_COMMENTS_FIELDS}
  ]),
  project: toField([
    'id',
    'name',
    'shortName',
    'description',
    {leader: ISSUE_USER_FIELDS},
    {createdBy: ISSUE_USER_FIELDS},
    'ringId'
  ])
}
