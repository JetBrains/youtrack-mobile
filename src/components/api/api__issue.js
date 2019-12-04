/* @flow */
import qs from 'qs';
import ApiBase from './api__base';
import issueFields from './api__issue-fields';
import ApiHelper from './api__helper';
import {handleRelativeUrl} from '../config/config';
import log from '../log/log';

import type Auth from '../auth/auth';
import type {FieldValue} from '../../flow/CustomFields';
import type {IssueOnList, IssueFull, IssueComment, IssueProject} from '../../flow/Issue';
import type {IssueActivity} from '../../flow/Activity';
import issueActivityPageFields from './api__activities-issue-fields';

export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getIssue(id: string): Promise<IssueFull> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssue.toString()
    }, {encode: false});

    const issue = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}?${queryString}`);
    ['url', 'thumbnailURL'].forEach(
      fieldName => issue.attachments = ApiHelper.convertRelativeUrls(issue.attachments, fieldName, this.config.backendUrl)
    );

    return issue;
  }


  async getIssueComments(issueId: string): Promise<Array<IssueComment>> {
    const queryString = qs.stringify({
      fields: issueFields.issueComment.toString()
    });

    const comments = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/comments?${queryString}`);

    comments.forEach(comment => {
      comment.author.avatarUrl = handleRelativeUrl(comment.author.avatarUrl, this.config.backendUrl);
    });

    return comments;
  }

  async createIssue(issueDraft: IssueOnList) {
    const queryString = qs.stringify({
      draftId: issueDraft.id,
      fields: issueFields.issuesOnList.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`, 'POST', {});
  }

  async loadIssueDraft(draftId: string): IssueFull {
    const queryString = qs.stringify({fields: issueFields.singleIssue.toString()});
    const issue = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${draftId}?${queryString}`);
    ['url', 'thumbnailURL'].forEach(
      fieldName => issue.attachments = ApiHelper.convertRelativeUrls(issue.attachments, fieldName, this.config.backendUrl)
    );
    return issue;
  }

  /**
   * Creates (if issue has no id) or updates issue draft
   * @param issue
   * @returns {Promise}
     */
  async updateIssueDraft(issue: IssueFull): IssueFull {
    const queryString = qs.stringify({fields: issueFields.singleIssue.toString()});

    const updatedIssue = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${issue.id || ''}?${queryString}`, 'POST', issue);
    ['url', 'thumbnailURL'].forEach(
      fieldName => updatedIssue.attachments = ApiHelper.convertRelativeUrls(issue.attachments, fieldName, this.config.backendUrl)
    );
    return updatedIssue;
  }

  async updateIssueDraftFieldValue(issueId: string, fieldId: string, value: FieldValue) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, value};
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  async submitComment(issueId: string, comment: IssueComment) {
    const queryString = qs.stringify({fields: issueFields.issueComment.toString()});
    const url = `${this.youTrackIssueUrl}/${issueId}/comments/${comment.id || ''}?${queryString}`;

    const submittedComment = await this.makeAuthorizedRequest(url, 'POST', comment);
    if (submittedComment.author && submittedComment.author.avatarUrl) {
      submittedComment.author.avatarUrl = handleRelativeUrl(submittedComment.author.avatarUrl, this.config.backendUrl);
    }

    return submittedComment;
  }

  async updateCommentDeleted(issueId: string, commentId: string, deleted: boolean) {
    const queryString = qs.stringify({fields: issueFields.issueComment.toString()});
    const url = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}?${queryString}`;

    const comment = await this.makeAuthorizedRequest(url, 'POST', {deleted});
    comment.author.avatarUrl = handleRelativeUrl(comment.author.avatarUrl, this.config.backendUrl);

    return comment;
  }

  async deleteCommentPermanently(issueId: string, commentId: string) {
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/comments/${commentId}`, 'DELETE', null, {parseJson: false});
  }


  attachFile(issueId: string, fileUri: string, fileName: string): Promise<XMLHttpRequest> {
    const formDataContent = new FormData(); //eslint-disable-line no-undef
    // $FlowFixMe
    formDataContent.append('photo', {uri: fileUri, name: fileName, type: 'image/binary'});

    return new Promise((resolve, reject) => {
      const STATE_DONE = 4;
      const xhr = new XMLHttpRequest(); //eslint-disable-line no-undef
      xhr.open('POST', `${this.youTrackUrl}/rest/issue/${issueId}/attachment`);
      const headers = this.auth.getAuthorizationHeaders();
      xhr.setRequestHeader('Authorization', headers.Authorization);

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== STATE_DONE) {
          return;
        }
        if (xhr.status >= 200 && xhr.status < 400) {
          log.log('attach result', xhr);
          return resolve(xhr);
        }
        return reject(xhr);
      };
      xhr.send(formDataContent);
    });
  }

  async updateIssueSummaryDescription(issue: IssueFull) {
    const queryString = qs.stringify({fields: 'id,value'});
    const body = {summary: issue.summary, description: issue.description};

    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}?${queryString}`, 'POST', body);
  }

  async updateIssueFieldValue(issueId: string, fieldId: string, value: FieldValue) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, value};
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  async updateIssueFieldEvent(issueId: string, fieldId: string, event: Object) {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, event};
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  async updateIssueStarred(issueId: string, hasStar: boolean) {
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/watchers`, 'POST', {hasStar});
  }

  async updateIssueVoted(issueId: string, hasVote: boolean) {
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/voters`, 'POST', {hasVote});
  }

  async updateProject(issue: IssueOnList, project: IssueProject) {
    const body = {
      id: issue.id,
      project: project
    };
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}`, 'POST', body);
  }

  async getVisibilityOptions(issueId: string): Promise<any> {
    const queryString = qs.stringify({
      $top: 50,
      fields: issueFields.getVisibility.toString()
    });
    const url = `${this.youTrackUrl}/api/visibilityGroups?${queryString}`;
    const visibilityOptions = await this.makeAuthorizedRequest(url, 'POST', {issues: [{id: issueId}]});
    visibilityOptions.visibilityUsers = ApiHelper.convertRelativeUrls((visibilityOptions.visibilityUsers || []), 'avatarUrl', this.config.backendUrl);
    return visibilityOptions;
  }

  async getMentionSuggests(issueIds: Array<string>, query: string) {
    const $top = 10;
    const fields = 'issues(id),users(id,login,fullName,avatarUrl)';
    const queryString = qs.stringify({$top, fields, query});
    const body = {issues: issueIds.map(id => ({id}))};
    const suggestions = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/mention?${queryString}`, 'POST', body);
    return ApiHelper.patchAllRelativeAvatarUrls(suggestions, this.config.backendUrl);
  }

  async getActivitiesPage(issueId: string, sources: Array<string>): Promise<Array<IssueActivity>> {
    const categoryKey = '&categories=';
    const categories = `${categoryKey}${(sources || []).join(categoryKey)}`;
    const queryString = qs.stringify({
      $top: 100,
      reverse: true,
      fields: issueActivityPageFields.toString()
    });

    const response = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/activitiesPage?${queryString}${categories}`);
    return response.activities;
  }

  removeAttachment(issueId: string, attachmentID: string) {
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/attachments/${attachmentID}`, 'DELETE', null, {parseJson: false});
  }
}
