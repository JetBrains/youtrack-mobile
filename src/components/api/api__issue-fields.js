/* @flow */

import ApiHelper from './api__helper';

const toField = ApiHelper.toField;

const ISSUE_PROJECT_FIELDS: any = toField([
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
          timeSpent: toField(['id', 'field(id,name)']),
        },
      ]),
    },
  },
]);

const ISSUE_USER_BASE_FIELDS = toField([
  'id',
  'fullName',
]);
const ISSUE_USER_FIELDS: any = toField([
  ISSUE_USER_BASE_FIELDS,
  'login',
  'ringId',
  'avatarUrl',
  'name',
]);

const BUNDLE_VALUE: any = toField([
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

  {color: ['id', 'background', 'foreground']},
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
        color: ['id', 'background', 'foreground'],
      },
    ],
  },
]);

const PROJECT_CUSTOM_FIELD_FIELDS = toField([
  '$type',
  'id',
  'ordinal',
  'canBeEmpty',
  'emptyFieldText',
  'isPublic',
  {
    bundle: ['id', 'isUpdateable'],
  },

  {
    field: [
      'id',
      'name',
      'ordinal',
      {
        fieldType: ['valueType', 'isMultiValue'],
      },
    ],
  },

  {defaultValues: BUNDLE_VALUE},
]);

const ISSUE_FIELD_FIELDS = toField([
  '$type',
  'id',
  'name',
  'hasStateMachine',

  ISSUE_FIELD_VALUE,

  {
    projectCustomField: PROJECT_CUSTOM_FIELD_FIELDS,
  },
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
        color: ['id', 'background', 'foreground'],
      },
    ],
  },
  {
    projectCustomField: [
      {
        field: ['id', 'name'],
      },
    ],
  },
]);

const ISSUE_TAGS_FIELDS: any = toField([
  'name',
  'id',
  'query',
  {
    color: ['id', 'background', 'foreground'],
  },
]);

const ISSUE_ATTACHMENTS_FIELDS: any = toField([
  'id',
  'name',
  'url',
  'thumbnailURL',
  'mimeType',
  'imageDimension(width,height)',
  'imageDimensions(width,height)',
  {author: ['ringId']},
]);

const USER_GROUP_FIELDS = toField([
  '$type',
  'id',
  'name',
  'allUsersGroup',
]);

const VISIBILITY_FIELDS: any = toField([{
  visibility: toField([
    '$type',
    {
      permittedGroups: [USER_GROUP_FIELDS],
    },
    {
      permittedUsers: [ISSUE_USER_FIELDS],
    },
    {
      implicitPermittedUsers: [ISSUE_USER_FIELDS],
    },
  ]),
}]);

const GET_VISIBILITY_FIELDS: any = toField([
  '$type',
  {
    visibilityGroups: USER_GROUP_FIELDS,
  }, {
    visibilityUsers: ISSUE_USER_FIELDS,
  },
]);

const ISSUE_COMMENTS_BASE_FIELDS = toField([
  'id',
  'text',
  'usesMarkdown',
  {author: ISSUE_USER_FIELDS},
  VISIBILITY_FIELDS,
]);

const ISSUE_COMMENTS_FIELDS: any = toField([
  ISSUE_COMMENTS_BASE_FIELDS,
  'created',
  'deleted',
  {
    attachments: ISSUE_ATTACHMENTS_FIELDS,
  },
]);

const ISSUE_COMMENTS_REMOVED: any = toField([
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
  'updated',
]);

const ISSUE_XSHORT_FIELDS: any = toField([
  ISSUE_BASE_FIELDS,
  {project: ISSUE_PROJECT_FIELDS},
]);

const ISSUE_SHORT_FIELDS: any = toField([
  ISSUE_XSHORT_FIELDS,
  {reporter: ISSUE_USER_FIELDS},
  {fields: ISSUE_FIELD_SHORT_FIELDS},
  {tags: ISSUE_TAGS_FIELDS},
]);

const ISSUE_LINKED_ISSUE_FIELDS: any = toField([
  'id',
  'idReadable',
  'summary',
  'resolved',
  {fields: ISSUE_FIELD_SHORT_FIELDS},
]);

const ISSUE_LINK_TYPES_FIELDS_BASE: any = toField([
  'sourceToTarget',
  'localizedSourceToTarget',
  'targetToSource',
  'localizedTargetToSource',
]);

const ISSUE_LINK_TYPES_FIELDS: any = toField([
  'id',
  'readOnly',
  'name',
  'aggregation',
  'directed',
  'outwards',
  'localizedName',
  ISSUE_LINK_TYPES_FIELDS_BASE,
]);

const ISSUE_LINKS_FIELDS_BASE: any = toField([
  'direction',
  'issuesSize',
  {linkType: ISSUE_LINK_TYPES_FIELDS_BASE},
]);

const ISSUE_LINKS_FIELDS: any = toField([
  ISSUE_LINKS_FIELDS_BASE,
  'id',
  'unresolvedIssuesSize',
  {
    trimmedIssues: [
      'id',
      'idReadable',
      'summary',
      'resolved',
      'project(ringId)',
    ],
  },
]);

const ISSUE_FOLDER_FIELDS: any = toField([
  'id',
  'name',
  'query',
  'isUpdatable',
  {owner: ['id', 'ringId']},
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
  'suffix',
]);

const COMMAND_SUGGESTION_FIELDS: any = toField([
  'query',
  'caret',
  {commands: ['description', 'error', 'delete']},
  {suggestions: SUGGESTION_FIELDS},
]);

const USER_AGREEMENT_FIELDS = 'endUserAgreement(enabled,text,majorVersion,minorVersion)';
const USER_CONSENT_FIELDS = 'endUserAgreementConsent(accepted,majorVersion,minorVersion)';

const REACTION: any = toField([
  'id',
  'reaction',
  {author: ISSUE_USER_FIELDS},
]);

const ISSUE_WORK_ITEMS_DURATION_FIELDS = toField([
  'id',
  'minutes',
  'presentation',
]);

const ISSUE_WORK_ITEMS_FIELDS: any = toField([
  'id',
  'text',
  'name',
  'date',
  'usesMarkdown',
  {
    type: ['name', 'id'],
    duration: ISSUE_WORK_ITEMS_DURATION_FIELDS,
    creator: ISSUE_USER_FIELDS,
    author: ISSUE_USER_FIELDS,
  },
]);

const ISSUE_WORK_ITEM_TEMPLATE = toField([
  {
    workItemTemplate: toField([
      'date',
      {
        type: ['name', 'id'],
        duration: ['presentation'],
        creator: ISSUE_USER_FIELDS,
        author: ISSUE_USER_FIELDS,
      },
    ]),
  }]);

const ISSUE_TIME_TRACKING_WITH_DRAFT_FIELDS: any = toField([
  'enabled',
  {
    draftWorkItem: ISSUE_WORK_ITEMS_FIELDS,
  },
  ISSUE_WORK_ITEM_TEMPLATE,
]);

export default {
  attachments: ISSUE_ATTACHMENTS_FIELDS,
  issuesOnList: ISSUE_SHORT_FIELDS,
  singleIssueLinks: ISSUE_LINKS_FIELDS,
  issueLinkBase: ISSUE_LINKS_FIELDS_BASE,
  issueLinkTypes: ISSUE_LINK_TYPES_FIELDS,
  issueLinks: ISSUE_LINKED_ISSUE_FIELDS,
  singleIssue: (toField([
    'id',
    'idReadable',
    'summary',
    'description',
    'resolved',
    'created',
    'votes',
    'updated',
    'wikifiedDescription',
    'usesMarkdown',
    {watchers: 'hasStar'},
    {voters: 'hasVote'},
    {project: ISSUE_PROJECT_FIELDS},
    {reporter: ISSUE_USER_FIELDS},
    {updater: ISSUE_USER_FIELDS},
    {fields: ISSUE_FIELD_FIELDS},
    {tags: ISSUE_TAGS_FIELDS},
    {attachments: ISSUE_ATTACHMENTS_FIELDS},
    VISIBILITY_FIELDS,
  ]): any),
  projectOnList: ISSUE_PROJECT_FIELDS,
  project: (toField([
    'id',
    'name',
    'shortName',
    'description',
    {leader: ISSUE_USER_FIELDS},
    {createdBy: ISSUE_USER_FIELDS},
    'ringId',
    {fields: PROJECT_CUSTOM_FIELD_FIELDS},
  ]): any),
  bundle: (toField([
    'id',
    'isUpdateable',
    {values: BUNDLE_VALUE},
    {aggregatedUsers: ISSUE_USER_FIELDS},
  ]): any),
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
  ISSUE_COMMENTS_REMOVED_FIELDS: ISSUE_COMMENTS_REMOVED,
  ISSUE_XSHORT_FIELDS: ISSUE_XSHORT_FIELDS,

  VISIBILITY: VISIBILITY_FIELDS,

  ISSUE_TAGS_FIELDS: ISSUE_TAGS_FIELDS,

  reaction: REACTION,

  timeTracking: ISSUE_TIME_TRACKING_WITH_DRAFT_FIELDS,
  workItems: ISSUE_WORK_ITEMS_FIELDS,
};
