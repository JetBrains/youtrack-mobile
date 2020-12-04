/* @flow */

import qs from 'qs';

import ApiBase from './api__base';
import issueActivityPageFields from './api__activities-issue-fields';
import issueFields from './api__issue-fields';
import {activityArticleCategory} from '../activity/activity__category';

import type {Article} from '../../flow/Article';
import type {Activity} from '../../flow/Activity';

export default class ArticlesAPI extends ApiBase {
  categories: Array<string> = Object.keys(activityArticleCategory).map((key: string) => activityArticleCategory[key]);

  async get(query: string | null = null, $top: number = 10000, $skip: number = 0): Promise<Array<Article>> {
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

  async getArticle(articleId: string): Promise<Article> {
    const fields: string = ApiBase.createFieldsQuery([
      {attachments: issueFields.attachments},
      'content',
      'created',
      'hasStar',
      'hasUnpublishedChanges',
      'id',
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

  async getActivitiesPage(articleId: string): Promise<Array<Activity>> {
    const categoryKey = '&categories=';
    const categories = `${categoryKey}${(this.categories).join(categoryKey)}`;
    const queryString = qs.stringify({
      $top: 100,
      reverse: true,
      fields: issueActivityPageFields.toString()
    });

    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/activitiesPage?${queryString}${categories}`);
  }

}
