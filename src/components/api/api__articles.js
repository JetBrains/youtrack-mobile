/* @flow */

import qs from 'qs';

import ApiBase from './api__base';
import articleFields from './api__articles-fields';
import issueActivityPageFields from './api__activities-issue-fields';
import issueFields from './api__issue-fields';
import {activityArticleCategory} from '../activity/activity__category';

import type {Article} from '../../flow/Article';
import type {Activity} from '../../flow/Activity';
import type {IssueComment} from '../../flow/CustomFields';

export default class ArticlesAPI extends ApiBase {
  articleFieldsQuery: string = ApiBase.createFieldsQuery(articleFields);
  categories: Array<string> = Object.keys(activityArticleCategory).map((key: string) => activityArticleCategory[key]);
  commentFields: string = issueFields.issueComment.toString();
  articleCommentFieldsQuery: string = ApiBase.createFieldsQuery(this.commentFields);

  async get(query: string | null = null, $top: number = 10000, $skip: number = 0): Promise<Array<Article>> {
    const fields: string = ApiBase.createFieldsQuery(
      ['id,idReadable,summary,parentArticle(id),project(id,name),ordinal,visibility($type)'],
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
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}?${this.articleFieldsQuery}`
    );
  }

  async updateArticle(articleId: string, data: Object | null = null): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}?${this.articleFieldsQuery}`,
      'POST',
      data
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

  async getArticleDrafts(draftId: ?string, original?: string): Promise<Article> {
    const originalParam: string = `&original=${original || 'null'}`;
    const articleDraftId: string = draftId || '';
    const url: string = `${this.youTrackApiUrl}/admin/users/me/articleDrafts/${articleDraftId}?${this.articleFieldsQuery}${originalParam}`;
    return this.makeAuthorizedRequest(url, 'GET');
  }

  async createArticleDraft(articleId?: string): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/admin/users/me/articleDrafts?${this.articleFieldsQuery}`,
      'POST',
      (articleId
        ? {originalArticle: {id: articleId}}
        : {project: null, parentArticle: null, summary: '', content: ''})
    );
  }

  async updateArticleDraft(articleDraft: Article): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/admin/users/me/articleDrafts/${articleDraft.id}?${this.articleFieldsQuery}`,
      'POST',
      {
        content: articleDraft.content,
        parentArticle: articleDraft.parentArticle,
        project: articleDraft.project,
        summary: articleDraft.summary,
        visibility: articleDraft.visibility
      }
    );
  }

  async publishArticleDraft(articleDraftId: string): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/?draftId=${articleDraftId}`,
      'POST',
      {}
    );
  }

  async deleteArticle(articleId: string): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  getVisibilityOptions = async (articleId: string, url?: string): Promise<Article> => {
    const queryString = ApiBase.createFieldsQuery(
      issueFields.getVisibility.toString(),
      {$visibilityTop: 50, $visibilitySkip: 0},
    );
    const requestURL: string = url || `${this.youTrackApiUrl}/articles/${articleId}/visibilityOptions`;
    return await this.makeAuthorizedRequest(
      `${requestURL}?${queryString}`,
      'GET',
    );
  };

  getDraftVisibilityOptions = async (articleId: string, ): Promise<Article> => (
    this.getVisibilityOptions(
      articleId, `${this.youTrackApiUrl}/admin/users/me/articleDrafts/${articleId}/visibilityOptions`)
  );

  async getCommentDraft(articleId: string): Promise<Comment> {
    const fields: string = ApiBase.createFieldsQuery(
      {draftComment: this.commentFields}
    );
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/?${fields}`,
      'GET'
    );
  }

  async doUpdateCommentDraft(articleId: string, commentText: string, method: string): Promise<Comment> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/draftComment?${this.articleCommentFieldsQuery}`,
      method,
      {
        text: commentText,
        usesMarkdown: true
      }
    );
  }

  async createCommentDraft(articleId: string, commentText: string): Promise<IssueComment> {
    return this.doUpdateCommentDraft(articleId, commentText, 'PUT');
  }

  async updateCommentDraft(articleId: string, commentText: string): Promise<IssueComment> {
    return this.doUpdateCommentDraft(articleId, commentText, 'POST');
  }

  async submitCommentDraft(articleId: string, articleCommentDraftId: string): Promise<IssueComment> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/comments?draftId=${articleCommentDraftId}&${this.articleCommentFieldsQuery}`,
      'POST',
      {}
    );
  }

  async updateComment(articleId: string, comment: IssueComment): Promise<IssueComment> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/comments/${comment.id}?${this.articleCommentFieldsQuery}`,
      'POST',
      {
        text: comment.text,
        usesMarkdown: true,
        visibility: comment.visibility || null
      }
    );
  }

  async deleteComment(articleId: string, commentId: string): Promise<IssueComment> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/comments/${commentId}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

}
