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

export default {
  issuesOnList: toField([
    'id',
    'summary',
    'resolved',
    {project: ISSUE_PROJECT_FIELDS},
    'numberInProject',
    {reporter: ISSUE_USER_FIELDS},
    {fields: ISSUE_FIELD_FIELDS}
  ])
}
