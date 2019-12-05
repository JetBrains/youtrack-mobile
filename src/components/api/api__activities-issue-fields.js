/* @flow */
import ApiHelper from './api__helper';
import IssueFields from './api__issue-fields';

const toField = ApiHelper.toField;

const ISSUE_ACTIVITIES_EVENT_BASE = toField([
  'id',
  'name',
  'text',
  'color(id)',
]);

const ISSUE_ATTACHMENT_FIELDS = toField([
  'id',
  'url',
  'mimeType',
  'removed',
  'thumbnailURL',
  'imageDimension(width,height)'
]);

const ISSUE_PROJECT_FIELDS = toField([
  'shortName'
]);

const ISSUE_WORK_ITEMS_FIELDS = toField([
  '$type',
  'date',
  {
    type: ['name'],
    duration: ['minutes']
  }
]);


const ISSUE_ACTIVITIES_FIELDS = toField([
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
            fieldType: [
              'isMultiValue',
              'valueType'
            ]
          }
        ]
      }
    ],
    added: [
      ISSUE_PROJECT_FIELDS,

      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.ISSUE_COMMENTS_WITH_ATTACHMENT_FIELDS,
      ISSUE_ATTACHMENT_FIELDS,

      IssueFields.ISSUE_XSHORT_FIELDS,

      ISSUE_WORK_ITEMS_FIELDS,
    ],
    removed: [
      ISSUE_PROJECT_FIELDS,

      ISSUE_ACTIVITIES_EVENT_BASE,
      IssueFields.ISSUE_COMMENTS_REMOVED_FIELDS,

      IssueFields.ISSUE_XSHORT_FIELDS
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
