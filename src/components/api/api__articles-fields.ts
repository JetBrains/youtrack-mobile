import ApiHelper from './api__helper';
import issueFields from './api__issue-fields';
const toField = ApiHelper.toField;
const childArticlesFields: string[] = ['id', 'idReadable', 'summary'];
export const articleChildrenAndSubChildren: any = toField([
  {
    childArticles: childArticlesFields.concat({
      childArticles: childArticlesFields,
    }),
  },
]);
export const articleFields: any = toField([
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
  'comments(id)',
  articleChildrenAndSubChildren,
  {
    attachments: issueFields.attachments,
  },
  {
    mentionedArticles: ['$type', 'idReadable'],
  },
  {
    mentionedIssues: ['$type', 'id', 'idReadable', 'resolved'],
  },
  {
    mentionedUsers: issueFields.user,
  },
  {
    parentArticle: ['id', 'idReadable', 'summary'],
  },
  {
    project: ['id', 'name', 'ringId'],
  },
  {
    reporter: issueFields.user,
  },
  {
    updatedBy: issueFields.user,
  },
  issueFields.VISIBILITY,
]);
export const articlesFields: any = toField([
  'id',
  'idReadable',
  'summary',
  'ordinal',
  'project(id,name,pinned)',
  {
    childArticles: childArticlesFields,
  },
  {
    parentArticle: ['id', 'visibility($type)'],
  },
  'visibility($type)',
]);
