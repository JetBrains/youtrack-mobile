/* @flow */
import ApiHelper from './api__helper';

const toField = ApiHelper.toField;

const ISSUE_PROJECT_FIELDS = toField([
  '$type',
  'id',
  'name',
  'archived',
  'shortName',
  'ringId',
  {
    plugins: {
      timeTrackingSettings: toField([
        'enabled',
        {
          timeSpent: toField(['id', 'field(id,name)'])
        }
      ])
    }
  }
]);

const ISSUE_USER_FIELDS = toField([
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

const ISSUE_FIELD_VALUE = toField([
  {
    value: [
      '$type',
      'id',
      'name',
      'ringId',
      'fullName',
      'avatarUrl',
      'login',
      'minutes',
      'presentation',
      'text',
      'isResolved',

      {
        color: ['id', 'background', 'foreground']
      }
    ]
  }
]);

const PROJECT_CUSTOM_FIELD_FIELDS = toField([
  '$type',
  'id',
  'ordinal',
  'canBeEmpty',
  'emptyFieldText',
  'isPublic',
  {
    bundle: ['id', 'isUpdateable']
  },

  {
    field: [
      'id',
      'name',
      'ordinal',
      {
        fieldType: ['valueType', 'isMultiValue']
      }
    ]
  },

  {defaultValues: BUNDLE_VALUE}
]);

const ISSUE_FIELD_FIELDS = toField([
  '$type',
  'id',
  'name',
  'hasStateMachine',

  ISSUE_FIELD_VALUE,

  {
    projectCustomField: PROJECT_CUSTOM_FIELD_FIELDS
  }
]);

const ISSUE_FIELD_SHORT_FIELDS = toField([
  'id',
  'name',
  '$type',
  {
    value: [
      'id',
      'name',
      'ringId',
      'avatarUrl',
      'login',
      'presentation',
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
  'thumbnailURL',
  'mimeType',
  'imageDimension(width,height)'
]);

const USER_GROUP_FIELDS = toField([
  '$type',
  'id',
  'name',
  'allUsersGroup',
]);

const VISIBILITY_FIELDS = toField([{
  visibility: toField([
    '$type',
    {
      permittedGroups: [USER_GROUP_FIELDS]
    },
    {
      permittedUsers: [ISSUE_USER_FIELDS]
    },
    {
      implicitPermittedUsers: [ISSUE_USER_FIELDS]
    }
  ])
}]);

const GET_VISIBILITY_FIELDS = toField([
  '$type',
  {
    visibilityGroups: USER_GROUP_FIELDS
  }, {
    visibilityUsers: ISSUE_USER_FIELDS
  }
]);

const ISSUE_COMMENTS_FIELDS = toField([
  'id',
  'created',
  'deleted',
  'text',
  'textPreview',
  'usesMarkdown',
  {author: ISSUE_USER_FIELDS},
  VISIBILITY_FIELDS
]);

const ISSUE_COMMENTS_WITH_ATTACHMENT_FIELDS = toField([
  'id',
  'created',
  'deleted',
  'text',
  'textPreview',
  'usesMarkdown',
  {author: ISSUE_USER_FIELDS},
  VISIBILITY_FIELDS,
  {
    attachments: [
      'url',
      'mimeType',
      'imageDimension(width,height)'
    ]
  }
]);

const ISSUE_COMMENTS_REMOVED = toField([
  'id',
  'created',
  'deleted',
]);

const ISSUE_BASE_FIELDS = toField([
  'id',
  'idReadable',
  'summary',
  'resolved',
  'created',
  'updated'
]);

const ISSUE_XSHORT_FIELDS = toField([
  ISSUE_BASE_FIELDS,
  {project: ISSUE_PROJECT_FIELDS},
]);

const ISSUE_SHORT_FIELDS = toField([
  ISSUE_XSHORT_FIELDS,
  {reporter: ISSUE_USER_FIELDS},
  {fields: ISSUE_FIELD_SHORT_FIELDS},
  {tags: ISSUE_TAGS_FIELDS}
]);

const ISSUE_LINKS_FIELDS = toField([
  'id',
  'direction',
  {
    linkType: [
      'name',
      'sourceToTarget',
      'localizedSourceToTarget',
      'targetToSource',
      'localizedTargetToSource'
    ],
    trimmedIssues: ISSUE_BASE_FIELDS
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
  {commands: ['description', 'error', 'delete']},
  {suggestions: SUGGESTION_FIELDS}
]);

const USER_AGREEMENT_FIELDS = 'endUserAgreement(enabled,text,majorVersion,minorVersion)';
const USER_CONSENT_FIELDS = 'endUserAgreementConsent(accepted,majorVersion,minorVersion)';

export default {
  issuesOnList: ISSUE_SHORT_FIELDS,
  singleIssue: toField([
    'id',
    'idReadable',
    'summary',
    'description',
    'resolved',
    'created',
    'votes',
    'updated',
    'wikifiedDescription',
    {watchers: 'hasStar'},
    {voters: 'hasVote'},
    {project: ISSUE_PROJECT_FIELDS},
    {reporter: ISSUE_USER_FIELDS},
    {updater: ISSUE_USER_FIELDS},
    {fields: ISSUE_FIELD_FIELDS},
    {tags: ISSUE_TAGS_FIELDS},
    {attachments: ISSUE_ATTACHMENTS_FIELDS},
    {links: ISSUE_LINKS_FIELDS},
    VISIBILITY_FIELDS
  ]),
  projectOnList: ISSUE_PROJECT_FIELDS,
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
  bundleValues: BUNDLE_VALUE,
  user: ISSUE_USER_FIELDS,
  issueComment: ISSUE_COMMENTS_FIELDS,
  issueFolder: ISSUE_FOLDER_FIELDS,
  commandSuggestionFields: COMMAND_SUGGESTION_FIELDS,
  userAgreement: USER_AGREEMENT_FIELDS,
  userConsent: USER_CONSENT_FIELDS,
  getVisibility: GET_VISIBILITY_FIELDS,

  ISSUE_USER_FIELDS: ISSUE_USER_FIELDS,
  ISSUE_COMMENTS_FIELDS: ISSUE_COMMENTS_FIELDS,
  ISSUE_COMMENTS_WITH_ATTACHMENT_FIELDS: ISSUE_COMMENTS_WITH_ATTACHMENT_FIELDS,
  ISSUE_COMMENTS_REMOVED_FIELDS: ISSUE_COMMENTS_REMOVED,
  ISSUE_XSHORT_FIELDS: ISSUE_XSHORT_FIELDS,

  VISIBILITY: VISIBILITY_FIELDS
};
