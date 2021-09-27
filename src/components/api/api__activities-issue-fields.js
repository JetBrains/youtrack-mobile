/* @flow */

import ApiHelper from './api__helper';
import IssueFields from './api__issue-fields';
import {checkVersion} from '../feature/feature';

const toField = ApiHelper.toField;
const isActualVersion: boolean = checkVersion('2020.1');
const getUserFields: string = (fieldName: string) => (
  isActualVersion ? `${fieldName}(@user)` : `${fieldName}(id,fullName,avatarUrl)`
);

const ISSUE_ACTIVITIES_EVENT_BASE = toField([
  'id',
  'name',
  'text',
  'color(id)',
]);

const ISSUE_PROJECT_FIELDS = toField([
  'shortName',
]);

const ISSUE_WORK_ITEMS_FIELDS = toField([
  '$type',
  'date',
  {
    type: ['id,name'],
    duration: ['presentation'],
  },
]);

const VCS_INTEGRATION_PROCESSOR_FIELDS = toField([
  '$type',
  'id',
]);

const PULL_REQUEST_FIELDS = toField([
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
  getUserFields('user'),
  getUserFields('author'),
]);

const VCS_INTEGRATION_FIELDS = toField([
  {
    commands: [
      'hasError',
      'errorText',
      'start',
      'end',
    ],
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
  getUserFields('user'),
  'userName',
  'version',
  {
    processors: [VCS_INTEGRATION_PROCESSOR_FIELDS],
  },
  'urls',
]);

const ISSUE_ACTIVITIES_FIELDS = toField([
  'id',
  'timestamp',
  'targetMember',
  'targetSubMember',
  {
    authorGroup: ['icon', 'name'],
    author: isActualVersion ? ['@user'] : IssueFields.ISSUE_USER_FIELDS,
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
            fieldType: [
              'isMultiValue',
              'valueType',
            ],
          },
        ],
      },
    ],
    pullRequest: PULL_REQUEST_FIELDS,
    added: [
      ISSUE_PROJECT_FIELDS,

      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.issueComment,

      IssueFields.ISSUE_XSHORT_FIELDS,

      ISSUE_WORK_ITEMS_FIELDS,

      'reactionOrder',
      {
        reactions: [
          'id',
          'reaction',
          getUserFields('author'),
        ],
      },

      VCS_INTEGRATION_FIELDS,
    ],
    removed: [
      ISSUE_PROJECT_FIELDS,

      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.ISSUE_COMMENTS_REMOVED_FIELDS,

      IssueFields.ISSUE_XSHORT_FIELDS,
    ],
  },
]);


export const ISSUE_ATTACHMENT_FIELDS: Object = IssueFields.attachments;

export default (toField([
  {
    activities: ISSUE_ACTIVITIES_FIELDS,
  },
  'cursor',
  isActualVersion ? `till;@user:${IssueFields.ISSUE_USER_FIELDS}` : 'till',
]): any);
