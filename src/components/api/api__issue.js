/* @flow */
import qs from 'qs';
import ApiBase from './api__base';
import issueFields from './api__issue-fields';
import ApiHelper from './api__helper';
import {handleRelativeUrl} from '../config/config';
import issueActivityPageFields, {ISSUE_ATTACHMENT_FIELDS} from './api__activities-issue-fields';

import type Auth from '../auth/auth';
import type {Activity} from '../../flow/Activity';
import type {Attachment, FieldValue, IssueComment, IssueProject, Tag} from '../../flow/CustomFields';
import type {IssueFull, IssueOnList} from '../../flow/Issue';
import type {Visibility} from '../../flow/Visibility';
import type {WorkItem} from '../../flow/Work';

export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getIssue(id: string): Promise<IssueFull> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssue.toString()
    }, {encode: false});

    const issue = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}?${queryString}`);
    issue.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(issue.attachments, this.config.backendUrl);
    return issue;
  }

  async getIssueLinks(id: string): Promise<IssueFull> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssueLinks.toString()
    }, {encode: false});

    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}?${queryString}`);
  }

  async updateVisibility(issueId: string, visibility: Visibility | null) {
    const queryString = qs.stringify({fields: 'id,visibility($type,permittedGroups($type,id,name),permittedUsers($type,id,name))'});
    const url = `${this.youTrackIssueUrl}/${issueId}?${queryString}`;
    return await this.makeAuthorizedRequest(
      url,
      'POST',
      {visibility}
    );
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
    issue.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(issue.attachments, this.config.backendUrl);
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
    updatedIssue.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(updatedIssue.attachments, this.config.backendUrl);
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

  async addCommentReaction(issueId: string, commentId: string, reactionName: string) {
    const queryString = qs.stringify({
      fields: issueFields.reaction.toString()
    });
    const url: string = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}/reactions?${queryString}`;
    return this.makeAuthorizedRequest(url, 'POST', {reaction: reactionName});
  }

  async removeCommentReaction(issueId: string, commentId: string, reactionId: string) {
    const url: string = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}/reactions/${reactionId}`;
    return this.makeAuthorizedRequest(url, 'DELETE', null, {parseJson: false});
  }

  async getIssueAttachments(issueId: string): Promise<Array<Attachment>> {
    const queryString = qs.stringify({fields: ISSUE_ATTACHMENT_FIELDS.toString()});
    const attachments: Array<Attachment> = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/attachments?${queryString}`);
    return ApiHelper.convertAttachmentRelativeToAbsURLs(attachments, this.config.backendUrl);
  }

  async attachFile(issueId: string, fileUri: string, fileName: string): Promise<XMLHttpRequest> {
    const url = `${this.youTrackIssueUrl}/${issueId}/attachments?fields=id,name`;
    const headers = this.auth.getAuthorizationHeaders();
    const formData = new FormData(); //eslint-disable-line no-undef
    // $FlowFixMe
    formData.append('photo', {
      uri: fileUri,
      name: fileName,
      type: 'image/binary'
    });

    const response = await fetch(
      url,
      {
        method: 'POST',
        body: formData,
        headers: headers,
      }
    );

    return await response.json();
  }

  async updateIssueAttachmentVisibility(issueId: string, attachmentId: string, visibility: Visibility | null) {
    const queryString = qs.stringify({fields: 'id,thumbnailURL,url,visibility($type,permittedGroups($type,id),permittedUsers($type,id))'});
    const body = {visibility};

    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/attachments/${attachmentId}?${queryString}`, 'POST', body);
  }

  async updateIssueSummaryDescription(issue: IssueFull) {
    const queryString = qs.stringify({fields: 'id,value,summary,description'});
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

  getVisibilityOptions = async (issueId: string): Promise<any> => {
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

  async getActivitiesPage(issueId: string, sources: Array<string>): Promise<Array<Activity>> {
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

  removeIssueEntity(resourceName: string, issueId: string, entityId: string) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/${resourceName}/${entityId}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  removeTag(issueId: string, tagId: string) {
    return this.removeIssueEntity('tags', issueId, tagId);
  }

  removeAttachment(issueId: string, attachmentId: string) {
    return this.removeIssueEntity('attachments', issueId, attachmentId);
  }

  addTags(issueId: string, tags: Array<Tag>) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?${ApiBase.createFieldsQuery({tags: issueFields.ISSUE_TAGS_FIELDS})}`,
      'POST',
      {tags}
    );
  }

  async timeTracking(issueId: string) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking?${ApiBase.createFieldsQuery(issueFields.timeTracking)}`,
      'GET'
    );
  }

  async updateDraftWorkItem(issueId: string, draft: WorkItem) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/draftWorkItem?${ApiBase.createFieldsQuery(issueFields.workItems)}`,
      draft.id ? 'POST' : 'PUT',
      draft
    );
  }

  async createWorkItem(issueId: string, draft: WorkItem) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/workItems/${draft.$type ? draft.id : ''}?${ApiBase.createFieldsQuery(
        issueFields.workItems,
        draft.$type ? null : {draftId: draft.id}
      )}`,
      'POST',
      draft
    );
  }

  async deleteWorkItem(issueId: string, workItemId: string) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/workItems/${workItemId}?${ApiBase.createFieldsQuery(
        issueFields.workItems,
      )}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  async deleteDraftWorkItem(issueId: string) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/draftWorkItem`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  async updateCommentCheckbox(issueId: string, checked: boolean, position: number, comment: IssueComment) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/comments/${comment.id}?${ApiBase.createFieldsQuery(['text', 'updated', 'description'])}`,
      'POST',
      {
        checkboxes: [{
          checked,
          position
        }],
        text: comment.text
      }
    );
  }
}
