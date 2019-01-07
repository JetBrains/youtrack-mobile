/* @flow */
import ApiHelper from './api__helper';
import IssueFields from './api__issue-fields';

const toField = ApiHelper.toField;

const ISSUE_ACTIVITIES_EVENT_BASE = toField([
  '$type',
  'id',
  'name',
  'text',
  'color(id)',
]);

const ISSUE_ATTACHMENT_FIELDS = toField([
  'url',
  'mimeType',
  'removed',
  'thumbnailURL',
  'size',
  'created',
  {
    comment: ['id']
  }
]);

const ISSUE_PROJECT_FIELDS = toField([
  'shortName'
]);


const ISSUE_ACTIVITIES_FIELDS = toField([
  '$type',
  'id',
  'timestamp',
  'targetMember',
  'targetSubMember',
  {
    authorGroup: ['icon', 'name'],
    author: IssueFields.ISSUE_USER_FIELDS,
    category: ['id'],
    target: ['id', 'created', 'usesMarkdown'],
    added: [
      ISSUE_PROJECT_FIELDS,

      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.ISSUE_COMMENTS_FIELDS,
      ISSUE_ATTACHMENT_FIELDS
    ],
    removed: [
      ISSUE_PROJECT_FIELDS,

      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.ISSUE_COMMENTS_FIELDS
    ]
  }
]);




export default toField([
  'cursor',
  'till',
  {
    activities: ISSUE_ACTIVITIES_FIELDS
  }
]);
