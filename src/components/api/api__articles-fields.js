/* @flow */

import ApiHelper from './api__helper';
import issueFields from './api__issue-fields';

const toField = ApiHelper.toField;

export const articleFields = toField([
  '$type',
  'content',
  'created',
  'id',
  'idReadable',
  'ordinal',
  'summary',
  'updated',
  'hasStar',
  'hasUnpublishedChanges',
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
      'summary'
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

export const articlesFields = toField([
  'id',
  'idReadable',
  'summary',
  'ordinal',
  'project(id,name)',
  {
    parentArticle: [
      'id',
      'visibility($type)'
    ]
  },
  'visibility($type)'
]);

