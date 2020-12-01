/* @flow */

import ApiBase from './api__base';

import issueFields from './api__issue-fields';

import type {Article} from '../../flow/Article';


export default class ArticlesAPI extends ApiBase {

  get(query: string | null = null, $top: number = 100, $skip: number = 0): Promise<Array<Article>> {
    const fields: string = ApiBase.createFieldsQuery(
      ['id,idReadable,summary,parentArticle(id),project(id,name),ordinal'],
      {
        ...{$top},
        ...{$skip},
        ...{query}
      }
    );
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles?${fields}`
    );
  }

  getArticle(articleId: string): Promise<Article> {
    const fields: string = ApiBase.createFieldsQuery([
      {attachments: issueFields.attachments},
      'content',
      'created',
      'hasStar',
      'hasUnpublishedChanges',
      'idReadable',
      'mentionedArticles(id)',
      'mentionedIssues(idReadable)',
      {mentionedUsers: issueFields.ISSUE_USER_FIELDS},
      'ordinal',
      'parentArticle(id)',
      {project: ['id,name']},
      {reporter: issueFields.ISSUE_USER_FIELDS},
      'summary',
      'updated',
      {updatedBy: issueFields.ISSUE_USER_FIELDS},
      issueFields.VISIBILITY
    ]);
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}?${fields}`
    );
  }
}
