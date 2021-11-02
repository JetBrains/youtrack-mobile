/* @flow */

import ApiBase from './api__base';
import ApiHelper from './api__helper';
import issueActivityPageFields, {ISSUE_ATTACHMENT_FIELDS} from './api__activities-issue-fields';
import issueFields from './api__issue-fields';
import qs from 'qs';
import {handleRelativeUrl} from '../config/config';

import type Auth from '../auth/auth';
import type {Activity} from '../../flow/Activity';
import type {
  Attachment,
  CustomFieldText,
  FieldValue,
  IssueComment,
  IssueLink,
  IssueLinkType,
  IssueProject,
  Tag,
} from '../../flow/CustomFields';
import type {AnyIssue, IssueFull} from '../../flow/Issue';
import type {Visibility} from '../../flow/Visibility';
import type {WorkItem} from '../../flow/Work';

export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getIssue(id: string): Promise<IssueFull> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssue.toString(),
    }, {encode: false});

    const issue = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}?${queryString}`);
    issue.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(issue.attachments, this.config.backendUrl);
    return issue;
  }

  async getIssueLinks(id: string): Promise<Array<IssueLink>> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssueLinks.toString(),
    }, {encode: false});

    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}/links?${queryString}&$topLinks=200`);
  }

  getIssueLinksTitle(id: string): Promise<Array<IssueLink>> {
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${id}/links?fields=${issueFields.issueLinkBase.toString()}`);
  }

  getIssueLinkTypes(): Promise<Array<IssueLinkType>> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issueLinkTypes/?fields=${issueFields.issueLinkTypes.toString()}`
    );
  }

  removeIssueLink(issueId: string, linkedIssueId: string, linkTypeId: string): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/links/${linkTypeId}/issues/${linkedIssueId}`,
      'DELETE',
      null,
      {parseJson: false},
    );
  }

  addIssueLink(linkedIssueId: string, query: string): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/commands`,
      'POST',
      {
        issues: [{id: linkedIssueId}],
        query,
      },
    );
  }

  async updateVisibility(issueId: string, visibility: Visibility | null): Promise<any> {
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
      fields: issueFields.issueComment.toString(),
    });

    const comments = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/comments?${queryString}`);

    comments.forEach(comment => {
      comment.author.avatarUrl = handleRelativeUrl(comment.author.avatarUrl, this.config.backendUrl);
    });

    return comments;
  }

  async createIssue(issueDraft: $Shape<IssueFull>): Promise<any> {
    const queryString = qs.stringify({
      draftId: issueDraft.id,
      fields: issueFields.issuesOnList.toString(),
    });
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}?${queryString}`, 'POST', {});
  }

  async loadIssueDraft(draftId: string): Promise<IssueFull> {
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
  async updateIssueDraft(issue: $Shape<IssueFull>): Promise<IssueFull> {
    const queryString = qs.stringify({fields: issueFields.singleIssue.toString()});

    const updatedIssue = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${issue.id || ''}?${queryString}`, 'POST', issue);
    updatedIssue.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(updatedIssue.attachments, this.config.backendUrl);
    return updatedIssue;
  }

  async updateIssueDraftFieldValue(issueId: string, fieldId: string, value: FieldValue): Promise<any> {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, value};
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/admin/users/me/drafts/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  async getDraftComment(issueId: string): Promise<IssueComment> {
    const queryString = qs.stringify({
      fields: ApiHelper.toField({draftComment: issueFields.issueComment}).toString(),
    });

    const response: {draftComment: IssueComment} = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?${queryString}`
    );
    if ((response?.draftComment?.attachments || []).length > 0) {
      response.draftComment.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
        response.draftComment.attachments || [],
        this.config.backendUrl
      );
    }
    return response.draftComment;
  }

  async updateDraftComment(issueId: string, draftComment: $Shape<IssueComment>): Promise<IssueComment> {
    const queryString = qs.stringify({fields: issueFields.issueComment.toString()});

    const draft: $Shape<IssueComment> = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/draftComment/?${queryString}`,
      draftComment.id ? 'POST' : 'PUT',
      draftComment
    );
    if ((draft?.attachments || []).length > 0) {
      draft.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
        draft.attachments || [],
        this.config.backendUrl
      );
    }
    return draft;
  }

  async submitDraftComment(issueId: string, draftComment: $Shape<IssueComment>): Promise<IssueComment> {
    const queryString = qs.stringify({
      draftId: draftComment.id,
      fields: issueFields.issueComment.toString(),
    }
    );

    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/comments/?${queryString}`,
      'POST',
      {}
    );
  }

  async submitComment(issueId: string, comment: IssueComment): Promise<IssueComment> {
    const queryString = qs.stringify({fields: issueFields.issueComment.toString()});
    const url = `${this.youTrackIssueUrl}/${issueId}/comments/${comment.id || ''}?${queryString}`;

    const submittedComment = await this.makeAuthorizedRequest(url, 'POST', comment);
    if (submittedComment.author && submittedComment.author.avatarUrl) {
      submittedComment.author.avatarUrl = handleRelativeUrl(submittedComment.author.avatarUrl, this.config.backendUrl);
    }

    return submittedComment;
  }

  async updateCommentDeleted(issueId: string, commentId: string, deleted: boolean): Promise<any> {
    const queryString = qs.stringify({fields: issueFields.issueComment.toString()});
    const url = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}?${queryString}`;

    const comment = await this.makeAuthorizedRequest(url, 'POST', {deleted});
    comment.author.avatarUrl = handleRelativeUrl(comment.author.avatarUrl, this.config.backendUrl);

    return comment;
  }

  async deleteCommentPermanently(issueId: string, commentId: string): Promise<any> {
    return this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/comments/${commentId}`, 'DELETE', null, {parseJson: false});
  }

  async addCommentReaction(issueId: string, commentId: string, reactionName: string): Promise<any> {
    const queryString = qs.stringify({
      fields: issueFields.reaction.toString(),
    });
    const url: string = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}/reactions?${queryString}`;
    return this.makeAuthorizedRequest(url, 'POST', {reaction: reactionName});
  }

  async removeCommentReaction(issueId: string, commentId: string, reactionId: string): Promise<any> {
    const url: string = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}/reactions/${reactionId}`;
    return this.makeAuthorizedRequest(url, 'DELETE', null, {parseJson: false});
  }

  async getIssueAttachments(issueId: string): Promise<Array<Attachment>> {
    const queryString = qs.stringify({fields: ISSUE_ATTACHMENT_FIELDS.toString()});
    const attachments: Array<Attachment> = await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/attachments?${queryString}`);
    return ApiHelper.convertAttachmentRelativeToAbsURLs(attachments, this.config.backendUrl);
  }

  async attachFile(issueId: string, fileUri: string, fileName: string, mimeType: string): Promise<XMLHttpRequest> {
    const url = `${this.youTrackIssueUrl}/${issueId}/attachments?fields=id,name`;
    const headers = this.auth.getAuthorizationHeaders();
    const formData = new FormData(); //eslint-disable-line no-undef
    // $FlowFixMe
    formData.append('photo', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
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

  async attachFileToComment(
    issueId: string,
    fileUri: string,
    fileName: string,
    commentId?: string,
    mimeType: string,
    visibility: ?Visibility = null
  ): Promise<Array<Attachment>> {
    const resourcePath: string = commentId ? `comments/${commentId}` : 'draftComment';
    const url = `${this.youTrackIssueUrl}/${issueId}/${resourcePath}/attachments?fields=id,name,url,thumbnailURL,mimeType,imageDimensions(height,width)`;
    const formData = new FormData();
    // $FlowFixMe
    formData.append('photo', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
      visibility,
    });
    const response = await fetch(
      url,
      {
        method: 'POST',
        body: formData,
        headers: this.auth.getAuthorizationHeaders(),
      }
    );
    const addedAttachments: Array<Attachment> = await response.json();
    return ApiHelper.convertAttachmentRelativeToAbsURLs(
      addedAttachments,
      this.config.backendUrl
    );
  }

  async removeFileFromComment(issueId: string, attachmentId: string, commentId?: string): Promise<void> {
    const resourcePath: string = commentId ? '' : 'draftComment/';
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/${resourcePath}attachments/${attachmentId}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  async updateIssueAttachmentVisibility(issueId: string, attachmentId: string, visibility: ?Visibility): Promise<Attachment> {
    const queryString = qs.stringify({fields: 'id,thumbnailURL,url,visibility($type,permittedGroups($type,id),permittedUsers($type,id))'});
    const body = {visibility};

    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/attachments/${attachmentId}?${queryString}`, 'POST', body);
  }

  async saveIssueSummaryAndDescriptionChange(
    issueId: string,
    summary: string,
    description: string,
    fields?: Array<CustomFieldText>
  ): Promise<any> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssue.toString(),
    }, {encode: false});

    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?${queryString}`,
      'POST',
      {summary, description, fields});
  }

  async updateIssueFieldValue(issueId: string, fieldId: string, value: FieldValue): Promise<any> {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, value};
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  async updateIssueFieldEvent(issueId: string, fieldId: string, event: Object): Promise<any> {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    const body = {id: fieldId, event};
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`, 'POST', body);
  }

  async updateIssueStarred(issueId: string, hasStar: boolean): Promise<any> {
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/watchers`, 'POST', {hasStar});
  }

  async updateIssueVoted(issueId: string, hasVote: boolean): Promise<any> {
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issueId}/voters`, 'POST', {hasVote});
  }

  async updateProject(issue: AnyIssue, project: IssueProject): Promise<any> {
    const body = {
      id: issue.id,
      project: project,
    };
    return await this.makeAuthorizedRequest(`${this.youTrackIssueUrl}/${issue.id}`, 'POST', body);
  }

  getVisibilityOptions: ((issueId: string) => Promise<any>) = async (issueId: string): Promise<any> => {
    const queryString = qs.stringify({
      $top: 50,
      fields: issueFields.getVisibility.toString(),
    });
    const url = `${this.youTrackUrl}/api/visibilityGroups?${queryString}`;
    const visibilityOptions = await this.makeAuthorizedRequest(url, 'POST', {issues: [{id: issueId}]});
    visibilityOptions.visibilityUsers = ApiHelper.convertRelativeUrls((visibilityOptions.visibilityUsers || []), 'avatarUrl', this.config.backendUrl);
    return visibilityOptions;
  }

  async getMentionSuggests(issueIds: Array<string>, query: string): Promise<any> {
    const $top = 10;
    const fields = 'issues(id),users(id,login,fullName,avatarUrl)';
    const queryString = qs.stringify({$top, fields, query});
    const body = {issues: issueIds.map(id => ({id}))};
    const suggestions = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/mention?${queryString}`, 'POST', body);
    return ApiHelper.patchAllRelativeAvatarUrls(suggestions, this.config.backendUrl);
  }

  async getActivitiesPage(issueId: string, sources: Array<string>): Promise<Array<Activity>> {
    const categoryKey = 'categories=';
    const categories = `${categoryKey}${(sources || []).join(',')}`;
    const queryString = qs.stringify({
      $top: 100,
      reverse: true,
    });

    const response = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/activitiesPage?${categories}&${queryString}&fields=${issueActivityPageFields.toString()}`
    );
    return ApiHelper.patchAllRelativeAvatarUrls(response.activities, this.config.backendUrl);
  }

  removeIssueEntity(resourceName: string, issueId: string, entityId: string): any {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/${resourceName}/${entityId}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  removeTag(issueId: string, tagId: string): any {
    return this.removeIssueEntity('tags', issueId, tagId);
  }

  removeAttachment(issueId: string, attachmentId: string): any {
    return this.removeIssueEntity('attachments', issueId, attachmentId);
  }

  addTags(issueId: string, tags: Array<Tag>): any {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?${ApiBase.createFieldsQuery({tags: issueFields.ISSUE_TAGS_FIELDS})}`,
      'POST',
      {tags}
    );
  }

  async timeTracking(issueId: string): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking?${ApiBase.createFieldsQuery(issueFields.timeTracking)}`,
      'GET'
    );
  }

  async updateDraftWorkItem(issueId: string, draft: WorkItem): Promise<WorkItem> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/draftWorkItem?${ApiBase.createFieldsQuery(issueFields.workItems)}`,
      draft.id ? 'POST' : 'PUT',
      draft
    );
  }

  async createWorkItem(issueId: string, draft: WorkItem): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/workItems/${draft.$type ? (draft.id: any) : ''}?${ApiBase.createFieldsQuery(
        issueFields.workItems,
        draft.$type ? null : {draftId: draft.id}
      )}`,
      'POST',
      draft
    );
  }

  async deleteWorkItem(issueId: string, workItemId: string = ''): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/workItems/${workItemId}?${ApiBase.createFieldsQuery(
        issueFields.workItems,
      )}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  async deleteDraftWorkItem(issueId: string): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/draftWorkItem`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  async updateDescriptionCheckbox(issueId: string, checked: boolean, position: number, text: string): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?${ApiBase.createFieldsQuery(['text', 'updated', 'description'])}`,
      'POST',
      {
        checkboxes: [{
          checked,
          position,
        }],
        text,
      }
    );
  }

  async updateCommentCheckbox(issueId: string, checked: boolean, position: number, comment: IssueComment): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/comments/${comment.id}?${ApiBase.createFieldsQuery(['text', 'updated', 'description'])}`,
      'POST',
      {
        checkboxes: [{
          checked,
          position,
        }],
        text: comment.text,
      }
    );
  }
}
