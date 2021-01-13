/* @flow */

import ApiHelper from './api__helper';
import issueFields from './api__issue-fields';

const toField = ApiHelper.toField;

const articleFields = toField([
  '$type',
  'content',
  'created',
  'id',
  'idReadable',
  'ordinal',
  'summary',
  'updated',
  'hasStar',
  {attachments: issueFields.attachments},
  {
    mentionedArticles: [
      '$type',
      'idReadable'
    ]
  },
  {
    mentionedIssues: [
      '$type',
      'id',
      'idReadable',
      'resolved'
    ]
  },
  {mentionedUsers: issueFields.user},
  {
    parentArticle: [
      'id',
      'idReadable',
    ]
  },
  {
    project: [
      'id',
      'name',
      'ringId'
    ]
  },
  {reporter: issueFields.user},
  {updatedBy: issueFields.user},

  issueFields.VISIBILITY
]);


export default articleFields;
