/* @flow */
import ApiHelper from './api__helper';

const toField = ApiHelper.toField;

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
  'avatarUrl',
  'fullName'
]);

const BUNDLE_VALUE = toField([
  '$type',
  'id',
  'name',
  'description',
  'ordinal',
  'ringId', // for user bundle elements
  'login', // for user bundle elements
  'released',
  'archived',
  'isResolved',

  {owner: ['ringId', 'login']},

  {color: ['id', 'background', 'foreground']}
]);

const ISSUE_FIELD_VALUE = toField([{
    'value': [
      '$type',
      'id',
      'name',
      'ringId',
      'fullName',
      'avatarUrl',
      'login',
      'minutes',
      'presentation',
      'isResolved',

      {
        'color': ['id', 'background', 'foreground']
      }

    ]
  }]);

const PROJECT_CUSTOM_FIELD_FIELDS = toField([
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
      'isPublic',

      {
        'fieldType': [
          'valueType',
          'isMultiValue'
        ]
      }
    ]
  },

  {'defaultValues': BUNDLE_VALUE}
]);

const ISSUE_FIELD_FIELDS = toField([
  '$type',
  'id',
  'name',
  'hasStateMachine',

  ISSUE_FIELD_VALUE,

  {
    'projectCustomField': PROJECT_CUSTOM_FIELD_FIELDS
  }
]);

const ISSUE_FIELD_SHORT_FIELDS = toField([
  'id',
  'name',
  {
    value: [
      'id',
      'name',
      'ringId',
      'avatarUrl',
      'login',
      {
        color: ['id', 'background', 'foreground']
      }
    ]
  },
  {
    projectCustomField: [
      {
        field: ['id', 'name']
      }
    ]
  }
]);


const ISSUE_TAGS_FIELDS = toField([
  'name',
  'id',
  'query',
  {
    color: ['id', 'background', 'foreground']
  }
]);

const ISSUE_ATTACHMENTS_FIELDS = toField([
  'id',
  'name',
  'url',
  'mimeType'
]);

const ISSUE_COMMENTS_FIELDS = toField([
  'id',
  'text',
  'created',
  'textPreview',
  {author: ISSUE_USER_FIELDS}
]);

const ISSUE_SHORT_FIELDS = toField([
  'id',
  'summary',
  'resolved',
  'created',
  'updated',
  {project: ISSUE_PROJECT_FIELDS},
  'numberInProject',
  {reporter: ISSUE_USER_FIELDS},
  {fields: ISSUE_FIELD_SHORT_FIELDS}
]);

const ISSUE_LINKS_FIELDS = toField([
  'id',
  'direction',
  {
    linkType: [
      'uid',
      'name',
      'sourceToTarget',
      'localizedSourceToTarget',
      'targetToSource',
      'localizedTargetToSource'
    ],
    trimmedIssues: ISSUE_SHORT_FIELDS
  }
]);

const ISSUE_FOLDER_FIELDS = toField([
  'id',
  'name',
  'query',
  'isUpdatable',
  {owner: ['ringId']}
]);


const SUGGESTION_FIELDS = toField([
  'id',
  'caret',
  'comment',
  'completionStart',
  'completionEnd',
  'matchingStart',
  'matchingEnd',
  'description',
  'option',
  'prefix',
  'suffix'
]);

const COMMAND_SUGGESTION_FIELDS = toField([
  'query',
  'caret',
  {commands: ['description','error','delete']},
  {suggestions: SUGGESTION_FIELDS}
]);

export default {
  issuesOnList: ISSUE_SHORT_FIELDS,
  singleIssue: toField([
    'id',
    'summary',
    'description',
    'resolved',
    'created',
    'votes',
    'updated',
    'numberInProject',
    'wikifiedDescription',
    {watchers: 'hasStar'},
    {voters: 'hasVote'},
    {project: ISSUE_PROJECT_FIELDS},
    {reporter: ISSUE_USER_FIELDS},
    {updater: ISSUE_USER_FIELDS},
    {fields: ISSUE_FIELD_FIELDS},
    {tags: ISSUE_TAGS_FIELDS},
    {attachments: ISSUE_ATTACHMENTS_FIELDS},
    {comments: ISSUE_COMMENTS_FIELDS},
    {links: ISSUE_LINKS_FIELDS}
  ]),
  projectOnList: toField([
    'id',
    'name',
    'ringId',
    'shortName',
    'description'
  ]),
  project: toField([
    'id',
    'name',
    'shortName',
    'description',
    {leader: ISSUE_USER_FIELDS},
    {createdBy: ISSUE_USER_FIELDS},
    'ringId',
    {fields: PROJECT_CUSTOM_FIELD_FIELDS}
  ]),
  bundle: toField([
    'id',
    'isUpdateable',
    {values: BUNDLE_VALUE},
    {aggregatedUsers: ISSUE_USER_FIELDS}
  ]),
  issueComment: ISSUE_COMMENTS_FIELDS,
  issueFolder: ISSUE_FOLDER_FIELDS,
  commandSuggestionFields: COMMAND_SUGGESTION_FIELDS
};
