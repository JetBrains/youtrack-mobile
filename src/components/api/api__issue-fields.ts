import {toField} from 'util/to-field';
const ISSUE_PROJECT_FIELDS: any = toField([
  '$type',
  'id',
  'name',
  'archived',
  'shortName',
  'ringId',
  'template',
  {
    plugins: {
      timeTrackingSettings: toField([
        'enabled',
        {
          timeSpent: toField(['id', 'field(id,name,localizedName)']),
        },
      ]),
    },
  },
]);
const ISSUE_USER_BASE_FIELDS = toField(['id', 'fullName']);
const ISSUE_USER_FIELDS: any = toField([
  ISSUE_USER_BASE_FIELDS,
  'login',
  'ringId',
  'avatarUrl',
  'name',
  'localizedName',
]);
const BUNDLE_VALUE: any = toField([
  '$type',
  'id',
  'name',
  'localizedName',
  'description',
  'ordinal',
  'ringId', // for user bundle elements
  'login', // for user bundle elements
  'released',
  'archived',
  'isResolved',
  {
    owner: ['ringId', 'login'],
  },
  {
    color: ['id', 'background', 'foreground'],
  },
]);
const ISSUE_FIELD_VALUE = toField([
  {
    value: [
      '$type',
      'id',
      'name',
      'localizedName',
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
      'localizedName',
      'ordinal',
      {
        fieldType: ['valueType', 'isMultiValue'],
      },
    ],
  },
  {
    defaultValues: BUNDLE_VALUE,
  },
]);
const ISSUE_FIELD_FIELDS = toField([
  '$type',
  'id',
  'name',
  'localizedName',
  'hasStateMachine',
  ISSUE_FIELD_VALUE,
  {
    projectCustomField: PROJECT_CUSTOM_FIELD_FIELDS,
  },
]);
const ISSUE_FIELD_SHORT_FIELDS = toField([
  'id',
  'name',
  'localizedName',
  '$type',
  {
    value: [
      'id',
      'name',
      'localizedName',
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
        field: ['id', 'name', 'localizedName'],
      },
    ],
  },
]);
const ISSUE_TAGS_FIELDS: any = toField([
  'name',
  'localizedName',
  'id',
  'query',
  {
    color: ['id', 'background', 'foreground'],
  },
]);
const ISSUE_ATTACHMENTS_BASE_FIELDS: any = toField([
  'url',
  'thumbnailURL',
  'mimeType',
]);
const ISSUE_ATTACHMENTS_FIELDS: any = toField([
  ISSUE_ATTACHMENTS_BASE_FIELDS,
  'id',
  'name',
  'localizedName',
  'imageDimension(width,height)',
  'imageDimensions(width,height)',
  {
    author: ['ringId'],
  },
]);
const USER_GROUP_FIELDS = toField([
  '$type',
  'id',
  'name',
  'localizedName',
  'allUsersGroup',
]);
const VISIBILITY_FIELDS: any = toField([
  {
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
  },
]);
const GET_VISIBILITY_FIELDS: any = toField([
  '$type',
  {
    groupsWithoutRecommended: USER_GROUP_FIELDS,
    recommendedGroups: USER_GROUP_FIELDS,
    visibilityGroups: USER_GROUP_FIELDS,
    visibilityUsers: ISSUE_USER_FIELDS,
  },
]);
const ISSUE_COMMENTS_BASE_FIELDS = toField([
  'id',
  'text',
  'usesMarkdown',
  {
    author: ISSUE_USER_FIELDS,
  },
  VISIBILITY_FIELDS,
]);
const ISSUE_COMMENTS_FIELDS: any = toField([
  ISSUE_COMMENTS_BASE_FIELDS,
  'created',
  'updated',
  'deleted',
  'hasEmail',
  {
    attachments: ISSUE_ATTACHMENTS_FIELDS,
  },
]);
const ISSUE_COMMENTS_REMOVED: any = toField(['id', 'created', 'deleted']);
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
  {
    project: ISSUE_PROJECT_FIELDS,
  },
]);
const ISSUE_SSHORT_FIELDS: any = toField([
  'id',
  'idReadable',
  'summary',
  'resolved',
  {
    fields: ISSUE_FIELD_SHORT_FIELDS,
  },
  {
    reporter: [
      'avatarUrl',
    ],
  },
]);
const ISSUE_MEDIUM_FIELDS: any = toField([
  ISSUE_XSHORT_FIELDS,
  {
    reporter: ISSUE_USER_FIELDS,
  },
  {
    fields: ISSUE_FIELD_SHORT_FIELDS,
  },
  {
    tags: ISSUE_TAGS_FIELDS,
  },
]);
const ISSUE_LARGE_FIELDS: any = toField([
  ISSUE_MEDIUM_FIELDS,
  'trimmedDescription',
]);
const ISSUE_LINKED_ISSUE_FIELDS: any = toField([
  'id',
  'idReadable',
  'project(name,ringId)',
  'summary',
  'resolved',
  {
    fields: ISSUE_FIELD_SHORT_FIELDS,
  },
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
  {
    linkType: ISSUE_LINK_TYPES_FIELDS_BASE,
  },
]);
const ISSUE_LINKS_FIELDS: any = toField([
  ISSUE_LINKS_FIELDS_BASE,
  'id',
  'unresolvedIssuesSize',
  {
    trimmedIssues: [ISSUE_LINKED_ISSUE_FIELDS],
  },
]);
const ISSUE_FOLDER_FIELDS: any = toField([
  '$type',
  'id',
  'issuesUrl',
  'name',
  'pinned',
  'query',
  'shortName',
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
  {
    commands: ['description', 'error', 'delete'],
  },
  {
    suggestions: SUGGESTION_FIELDS,
  },
]);
const USER_AGREEMENT_FIELDS =
  'endUserAgreement(enabled,text,majorVersion,minorVersion)';
const USER_CONSENT_FIELDS =
  'endUserAgreementConsent(accepted,majorVersion,minorVersion)';
const REACTION: any = toField([
  'id',
  'reaction',
  {
    author: ISSUE_USER_FIELDS,
  },
]);
const ISSUE_WORK_ITEMS_DURATION_FIELDS = toField([
  'id',
  'minutes',
  'presentation',
]);
const ISSUE_WORK_ITEMS_BASE_FIELDS: any = toField({
  type: ['name', 'localizedName', 'id'],
  creator: ISSUE_USER_FIELDS,
  author: ISSUE_USER_FIELDS,
  issue: ['id,project(id,ringId)'],
});
const ISSUE_WORK_ITEMS_FIELDS: any = toField([
  'id',
  'text',
  'name',
  'localizedName',
  'date',
  'usesMarkdown',
  ISSUE_WORK_ITEMS_BASE_FIELDS,
  {
    duration: ISSUE_WORK_ITEMS_DURATION_FIELDS,
  },
]);
const ISSUE_WORK_ITEM_TEMPLATE = toField([
  {
    workItemTemplate: toField([
      'date',
      ISSUE_WORK_ITEMS_BASE_FIELDS,
      {
        duration: ['presentation'],
      },
    ]),
  },
]);
const ISSUE_TIME_TRACKING_WITH_DRAFT_FIELDS: any = toField([
  'enabled',
  {
    draftWorkItem: ISSUE_WORK_ITEMS_FIELDS,
  },
  ISSUE_WORK_ITEM_TEMPLATE,
]);
const MENTIONS_FIELDS: any = toField([
  {
    mentionedUsers: [
      '$type',
      'fullName',
      'id',
      'login',
      'name',
      'ringId',
    ],
  },
  {
    mentionedArticles: [
      '$type',
      'id',
      'idReadable',
      'summary',
    ],
  },
  {
    mentionedIssues: [
      '$type',
      'id',
      'idReadable',
      'resolved',
      'ringId',
      'summary',
    ],
  },
]);
export default {
  attachments: ISSUE_ATTACHMENTS_FIELDS,
  attachmentsBase: ISSUE_ATTACHMENTS_BASE_FIELDS,
  issuesOnListS: ISSUE_SSHORT_FIELDS,
  issuesOnList: ISSUE_MEDIUM_FIELDS,
  issuesOnListL: ISSUE_LARGE_FIELDS,
  singleIssueLinks: ISSUE_LINKS_FIELDS,
  issueLinkBase: ISSUE_LINKS_FIELDS_BASE,
  issueLinkTypes: ISSUE_LINK_TYPES_FIELDS,
  issueLinks: ISSUE_LINKED_ISSUE_FIELDS,
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
    'usesMarkdown',
    'hasEmail',
    'comments(id)',
    {
      watchers: 'hasStar',
    },
    {
      voters: 'hasVote',
    },
    {
      project: ISSUE_PROJECT_FIELDS,
    },
    {
      reporter: ISSUE_USER_FIELDS,
    },
    {
      updater: ISSUE_USER_FIELDS,
    },
    {
      fields: ISSUE_FIELD_FIELDS,
    },
    {
      tags: ISSUE_TAGS_FIELDS,
    },
    {
      attachments: ISSUE_ATTACHMENTS_FIELDS,
    },
    MENTIONS_FIELDS,
    VISIBILITY_FIELDS,
  ]) as any,
  projectOnList: ISSUE_PROJECT_FIELDS,
  project: toField([
    'id',
    'name',
    'localizedName',
    'shortName',
    'description',
    {
      leader: ISSUE_USER_FIELDS,
    },
    {
      createdBy: ISSUE_USER_FIELDS,
    },
    'ringId',
    {
      fields: PROJECT_CUSTOM_FIELD_FIELDS,
    },
  ]) as any,
  bundle: toField([
    'id',
    'isUpdateable',
    {
      values: BUNDLE_VALUE,
    },
    {
      aggregatedUsers: ISSUE_USER_FIELDS,
    },
  ]) as any,
  bundleValues: BUNDLE_VALUE,
  user: ISSUE_USER_FIELDS,
  issueComment: ISSUE_COMMENTS_FIELDS,
  issueFolder: ISSUE_FOLDER_FIELDS,
  commandSuggestionFields: COMMAND_SUGGESTION_FIELDS,
  userAgreement: USER_AGREEMENT_FIELDS,
  userConsent: USER_CONSENT_FIELDS,
  getVisibility: GET_VISIBILITY_FIELDS,
  ISSUE_USER_FIELDS,
  ISSUE_COMMENTS_FIELDS,
  ISSUE_COMMENTS_REMOVED_FIELDS: ISSUE_COMMENTS_REMOVED,
  ISSUE_XSHORT_FIELDS,
  VISIBILITY: VISIBILITY_FIELDS,
  ISSUE_TAGS_FIELDS,
  reaction: REACTION,
  timeTracking: ISSUE_TIME_TRACKING_WITH_DRAFT_FIELDS,
  workItems: ISSUE_WORK_ITEMS_FIELDS,
  MENTIONS_FIELDS,
  ISSUE_BASE_FIELDS,
};
