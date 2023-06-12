import IssueFields from './api__issue-fields';
import {toField} from 'util/to-field';
const ISSUE_ACTIVITIES_EVENT_BASE = toField([
  'id',
  'name',
  'localizedName',
  'text',
  'color(id)',
]);
const ISSUE_PROJECT_FIELDS = toField(['$type', 'id', 'shortName', 'name', 'localizedName']);
const ISSUE_WORK_ITEMS_FIELDS = toField([
  '$type',
  'date',
  {
    type: ['id,name'],
    duration: ['presentation'],
    issue: ['id,project(id,ringId)'],
  },
]);
const VCS_INTEGRATION_PROCESSOR_FIELDS = toField(['$type', 'id']);
export const PULL_REQUEST_FIELDS = toField([
  'id',
  'noUserReason(id)',
  'noHubUserReason(id)',
  'fetched',
  'files',
  'userName',
  'date',
  'fetched',
  'url',
  'text',
  'title',
  'idExternal',
  'user(id,fullName,avatarUrl)',
  'author(id,fullName,avatarUrl)',
]);
const VCS_INTEGRATION_FIELDS = toField([
  {
    commands: ['hasError', 'errorText', 'start', 'end'],
  },
  'created',
  'date',
  'fetched',
  'files',
  'id',
  'noHubUserReason(id)',
  'noUserReason(id)',
  'reopened',
  'state(id)',
  'user(id,fullName,avatarUrl)',
  'userName',
  'version',
  {
    processors: [VCS_INTEGRATION_PROCESSOR_FIELDS],
  },
  'urls',
]);
export const ISSUE_ACTIVITIES_FIELDS_LEGACY: string = toField([
  'id',
  'timestamp',
  'targetMember',
  'targetSubMember',
  {
    authorGroup: ['icon', 'name'],
    author: IssueFields.ISSUE_USER_FIELDS,
    category: ['id'],
    target: ['id', 'created', 'usesMarkdown'],
    field: [
      'linkId',
      'id',
      'presentation',
      {
        customField: [
          'id',
          {
            fieldType: ['isMultiValue', 'valueType'],
          },
        ],
      },
    ],
    pullRequest: PULL_REQUEST_FIELDS,
    added: [
      ISSUE_PROJECT_FIELDS,
      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.issueComment,
      'usesMarkdown',
      IssueFields.ISSUE_XSHORT_FIELDS,
      ISSUE_WORK_ITEMS_FIELDS,
      'reactionOrder',
      'reaction',
      {
        reactions: ['id', 'reaction', 'author(id,fullName,avatarUrl)'],
      },
      VCS_INTEGRATION_FIELDS,
      IssueFields.attachmentsBase,
    ],
    removed: [
      'reaction',
      ISSUE_PROJECT_FIELDS,
      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.ISSUE_COMMENTS_REMOVED_FIELDS,
      IssueFields.ISSUE_XSHORT_FIELDS,
      IssueFields.attachmentsBase,
    ],
  },
]);
export const ISSUE_ATTACHMENT_FIELDS: Record<string, any> = IssueFields.attachments;
export const issueActivitiesFields: string = toField([
  {
    activities: [
      'id',
      'timestamp',
      'targetMember',
      'targetSubMember',
      {
        authorGroup: ['icon', 'name'],
        author: IssueFields.ISSUE_USER_FIELDS,
        category: ['id'],
        target: ['id', 'created', 'usesMarkdown'],
        field: [
          'linkId',
          'id',
          'presentation',
          {
            customField: [
              'id',
              {
                fieldType: ['isMultiValue', 'valueType'],
              },
            ],
          },
        ],
        pullRequest: PULL_REQUEST_FIELDS,
        added: ['@addedRemovedCommon'],
        removed: ['@addedRemovedCommon'],
      },
    ],
  },
  'cursor',
  'till',
])
  .toString()
  .concat(
    `${encodeURIComponent(';@')}addedRemovedCommon:${toField([
      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.issueComment,
      'usesMarkdown',
      IssueFields.ISSUE_BASE_FIELDS,
      {project: ISSUE_PROJECT_FIELDS},
      ISSUE_WORK_ITEMS_FIELDS,
      'reactionOrder',
      'reaction',
      {
        reactions: ['id', 'reaction', 'author(id,fullName,avatarUrl)'],
      },
      VCS_INTEGRATION_FIELDS,
      IssueFields.attachmentsBase,
      IssueFields.ISSUE_COMMENTS_REMOVED_FIELDS,
      IssueFields.MENTIONS_FIELDS,
    ]).toString()}`,
  );
