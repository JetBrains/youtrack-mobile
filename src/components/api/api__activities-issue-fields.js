/* @flow */
import ApiHelper from './api__helper';
import IssueFields from './api__issue-fields';

const toField = ApiHelper.toField;

const ISSUE_ACTIVITIES_EVENT_BASE = toField([
  '$type',
  'id',
  'name',
  'text',
  'color(id)'
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
      'shortName',
      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.ISSUE_COMMENTS_FIELDS
    ]
  }
]);

const ISSUE_ACTIVITIES_CURSOR_FIELDS = toField([
  'cursor',
  'till',
  {
    activities: ISSUE_ACTIVITIES_FIELDS
  }
]);

export default ISSUE_ACTIVITIES_CURSOR_FIELDS;
