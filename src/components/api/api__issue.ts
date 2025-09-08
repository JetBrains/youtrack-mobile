import qs from 'qs';

import ApiBase from './api__base';
import ApiHelper from './api__helper';
import issueFields from './api__issue-fields';
import {handleRelativeUrl} from 'components/config/config';
import {
  ISSUE_ATTACHMENT_FIELDS,
  ISSUE_ACTIVITIES_FIELDS_LEGACY,
  issueActivitiesFields,
} from './api__activities-issue-fields';

import type Auth from 'components/auth/oauth2';
import type {Activity} from 'types/Activity';
import type {
  Attachment,
  CustomFieldBaseValue,
  CustomFieldText,
  FieldValue,
  IssueComment,
  IssueLink,
  IssueLinkType,
  Tag,
} from 'types/CustomFields';
import type {AnyIssue, IssueCreate, IssueFull, IssueOnListExtended, IssueSprint} from 'types/Issue';
import type {NormalizedAttachment} from 'types/Attachment';
import type {Project} from 'types/Project';
import type {Visibility, VisibilityGroups} from 'types/Visibility';
import type {DraftWorkItem, WorkItem} from 'types/Work';
import type {User, UserCC} from 'types/User';
import type {UserGroup} from 'types/UserGroup';

export default class IssueAPI extends ApiBase {
  draftsURL: string = `${this.youTrackApiUrl}${
    this.isActualAPI ? '' : '/admin'
  }/users/me/drafts`;

  constructor(auth: Auth) {
    super(auth);
  }

  async getIssue(id: string): Promise<IssueFull> {
    const queryString = qs.stringify(
      {
        fields: issueFields.singleIssue.toString(),
      },
      {
        encode: false,
      },
    );
    const issue = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${id}?${queryString}`,
    );
    issue.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
      issue.attachments,
      this.config.backendUrl,
    );
    return ApiHelper.patchAllRelativeAvatarUrls(issue, this.config.backendUrl);
  }

  async deleteIssue(id: string): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${id}`,
      'DELETE',
      null,
      {
        parseJson: false,
      }
    );
  }

  async getIssueLinks(id: string): Promise<Array<IssueLink>> {
    const queryString = qs.stringify(
      {
        fields: issueFields.singleIssueLinks.toString(),
      },
      {
        encode: false,
      },
    );
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${id}/links?${queryString}&$topLinks=200`,
    );
  }

  getIssueLinksTitle(id: string): Promise<Array<IssueLink>> {
    return this.makeAuthorizedRequest(
      `${
        this.youTrackIssueUrl
      }/${id}/links?fields=${issueFields.issueLinkBase.toString()}`,
    );
  }

  getIssueLinkTypes(): Promise<Array<IssueLinkType>> {
    return this.makeAuthorizedRequest(
      `${
        this.youTrackApiUrl
      }/issueLinkTypes/?fields=${issueFields.issueLinkTypes.toString()}`,
    );
  }

  removeIssueLink(
    issueId: string,
    linkedIssueId: string,
    linkTypeId: string,
  ): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/links/${linkTypeId}/issues/${linkedIssueId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  addIssueLink(linkedIssueId: string, query: string): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/commands`,
      'POST',
      {
        issues: [
          {
            id: linkedIssueId,
          },
        ],
        query,
      },
    );
  }

  async updateVisibility(issueId: string, visibility: Visibility | null): Promise<{
    id: string;
    visibility: {
      $type: string;
      permittedGroups: {
        $type: string;
        id: string;
        name: string;
      },
      permittedUsers: {
        $type: string;
        id: string;
        name: string;
      }
    }
  }> {
    const queryString = qs.stringify({
      fields: 'id,visibility($type,permittedGroups($type,id,name),permittedUsers($type,id,name))',
    });
    const url = `${this.youTrackIssueUrl}/${issueId}?${queryString}`;
    return await this.makeAuthorizedRequest(url, 'POST', {visibility});
  }

  setCommentVisibility = async (visibility: VisibilityGroups | null, issueId: string, commentId: string) => {
    return await super.updateVisibility(`${this.youTrackIssueUrl}/${issueId}/comments/${commentId}`, visibility);
  };

  async getIssueComments(issueId: string): Promise<Array<IssueComment>> {
    const queryString = qs.stringify({
      fields: issueFields.issueComment.toString(),
    });
    const comments = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/comments?${queryString}`,
    );
    comments.forEach((comment: IssueComment) => {
      comment.author.avatarUrl = handleRelativeUrl(
        comment.author.avatarUrl,
        this.config.backendUrl,
      );
    });
    return comments;
  }

  async createIssue(draftId: string): Promise<IssueOnListExtended> {
    const queryString = qs.stringify({
      draftId,
      fields: issueFields.issuesOnList.toString(),
    });
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}?${queryString}`,
      'POST',
      {},
    );
  }

  async loadIssueDraft(draftId: string): Promise<IssueFull> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssue.toString(),
    });
    const issue = await this.makeAuthorizedRequest(
      `${this.draftsURL}/${draftId}?${queryString}`,
    );
    issue.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
      issue.attachments,
      this.config.backendUrl,
    );
    return issue;
  }

  async getUserIssueDrafts(): Promise<AnyIssue> {
    const queryString = qs.stringify({
      fields: issueFields.ISSUE_DRAFT_FIELDS.toString(),
    });
    return await this.makeAuthorizedRequest(
      `${this.draftsURL}/?${queryString}`,
    );
  }

  async updateIssueDraft(issue: IssueCreate): Promise<IssueFull> {
    const queryString = qs.stringify({
      fields: issueFields.singleIssue.toString(),
    });
    const updatedIssue = await this.makeAuthorizedRequest(
      `${this.draftsURL}/${issue.id || ''}?${queryString}`,
      'POST',
      issue,
    );
    updatedIssue.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
      updatedIssue.attachments,
      this.config.backendUrl,
    );
    return updatedIssue;
  }

  async deleteAllIssueDraftsExcept(id: string): Promise<IssueFull> {
    return await this.makeAuthorizedRequest(
      this.draftsURL,
      'PUT',
      [{id}],
      {parseJson: false}
    );
  }

  async deleteDraft(id: string): Promise<IssueFull> {
    return await this.makeAuthorizedRequest(
      `${this.draftsURL}/${id}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  async updateIssueDraftFieldValue(
    issueId: string,
    fieldId: string,
    value: CustomFieldBaseValue,
  ) {
    const queryString = qs.stringify({
      fields: 'id,ringId,value',
    });
    const body = {
      id: fieldId,
      value,
    };
    return await this.makeAuthorizedRequest(
      `${this.draftsURL}/${issueId}/fields/${fieldId}?${queryString}`,
      'POST',
      body,
    );
  }

  async getDraftComment(issueId: string): Promise<IssueComment> {
    const queryString = qs.stringify({
      fields: ApiHelper.toField({
        draftComment: issueFields.issueComment,
      }).toString(),
    });
    const response: {
      draftComment: IssueComment;
    } = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?${queryString}`,
    );

    if ((response?.draftComment?.attachments || []).length > 0) {
      response.draftComment.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
        response.draftComment.attachments || [],
        this.config.backendUrl,
      );
    }

    return response.draftComment;
  }

  async updateDraftComment(issueId: string, draftComment: IssueComment): Promise<IssueComment> {
    const queryString = qs.stringify({
      fields: issueFields.issueComment.toString(),
    });
    const draft: IssueComment = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/draftComment/?${queryString}`,
      draftComment.id ? 'POST' : 'PUT',
      draftComment,
    );

    if ((draft?.attachments || []).length > 0) {
      draft.attachments = ApiHelper.convertAttachmentRelativeToAbsURLs(
        draft.attachments || [],
        this.config.backendUrl,
      );
    }

    return draft;
  }

  async submitDraftComment(
    issueId: string,
    draftComment: Partial<IssueComment>,
  ): Promise<IssueComment> {
    const queryString = qs.stringify({
      draftId: draftComment.id,
      fields: issueFields.issueComment.toString(),
    });
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/comments/?${queryString}`,
      'POST',
      {},
    );
  }

  async submitComment(
    issueId: string,
    comment: IssueComment,
  ): Promise<IssueComment> {
    const queryString = qs.stringify({
      fields: issueFields.issueComment.toString(),
    });
    const url = `${this.youTrackIssueUrl}/${issueId}/comments/${
      comment.id || ''
    }?${queryString}`;
    const submittedComment = await this.makeAuthorizedRequest(
      url,
      'POST',
      comment,
    );

    if (submittedComment.author && submittedComment.author.avatarUrl) {
      submittedComment.author.avatarUrl = handleRelativeUrl(
        submittedComment.author.avatarUrl,
        this.config.backendUrl,
      );
    }

    return submittedComment;
  }

  async updateCommentDeleted(
    issueId: string,
    commentId: string,
    deleted: boolean,
  ) {
    const queryString = qs.stringify({
      fields: issueFields.issueComment.toString(),
    });
    const url = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}?${queryString}`;
    const comment = await this.makeAuthorizedRequest(url, 'POST', {
      deleted,
    });
    comment.author.avatarUrl = handleRelativeUrl(
      comment.author.avatarUrl,
      this.config.backendUrl,
    );
    return comment;
  }

  async deleteCommentPermanently(
    issueId: string,
    commentId: string,
  ) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async addCommentReaction(
    issueId: string,
    commentId: string,
    reactionName: string,
  ) {
    const queryString = qs.stringify({
      fields: issueFields.reaction.toString(),
    });
    const url: string = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}/reactions?${queryString}`;
    return this.makeAuthorizedRequest(url, 'POST', {
      reaction: reactionName,
    });
  }

  async removeCommentReaction(
    issueId: string,
    commentId: string,
    reactionId: string,
  ) {
    const url: string = `${this.youTrackIssueUrl}/${issueId}/comments/${commentId}/reactions/${reactionId}`;
    return this.makeAuthorizedRequest(url, 'DELETE', null, {
      parseJson: false,
    });
  }

  async getIssueAttachments(issueId: string): Promise<Array<Attachment>> {
    const queryString = qs.stringify({
      fields: ISSUE_ATTACHMENT_FIELDS.toString(),
    });
    const attachments: Attachment[] = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/attachments?${queryString}`,
    );
    return ApiHelper.convertAttachmentRelativeToAbsURLs(
      attachments,
      this.config.backendUrl,
    );
  }

  async attachFile(issueId: string, file: NormalizedAttachment): Promise<Attachment[]> {
    return super.attachFile(
      `${this.youTrackIssueUrl}/${issueId}`,
      file,
    );
  }

  async attachFileToComment(
    issueId: string,
    file: NormalizedAttachment,
    commentId: string | undefined,
  ): Promise<Attachment[]> {
    return super.attachFileToComment(
      `${this.youTrackIssueUrl}/${issueId}`,
      file,
      commentId
    );
  }

  async removeFileFromComment(
    issueId: string,
    attachmentId: string,
    commentId?: string,
  ): Promise<void> {
    const resourcePath: string = commentId ? '' : 'draftComment/';
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/${resourcePath}attachments/${attachmentId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async updateAttachmentVisibility(
    issueId: string,
    attachment: Attachment,
    visibility: Visibility,
  ): Promise<Attachment> {
    return await super.updateAttachmentVisibility(
      `issues/${issueId}`,
      attachment,
      visibility
    );
  }

  // @ts-ignore
  async updateCommentAttachmentVisibility(
    issueId: string,
    attachment: Attachment,
    visibility: Visibility,
    isCommentDraft: boolean,
  ): Promise<Attachment> {
    return await super.updateAttachmentVisibility(
      `issues/${issueId}${isCommentDraft ? '/draftComment' : ''}`,
      attachment,
      visibility
    );
  }

  async saveIssueSummaryAndDescriptionChange(
    issueId: string,
    summary: string,
    description: string,
    fields?: CustomFieldText[],
  ) {
    const queryString = qs.stringify(
      {fields: issueFields.singleIssue.toString()},
      {encode: false},
    );
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?${queryString}`,
      'POST',
      {
        summary,
        description,
        fields,
      },
    );
  }

  async updateIssueFieldValue(
    issueId: string,
    fieldId: string,
    value: FieldValue,
  ): Promise<{id: string; ringId: string; value: unknown}> {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`,
      'POST',
      {
        id: fieldId,
        value,
      },
    );
  }

  async updateIssueFieldEvent(
    issueId: string,
    fieldId: string,
    event: Record<string, any>,
  ): Promise<{id: string; ringId: string; value: unknown}> {
    const queryString = qs.stringify({fields: 'id,ringId,value'});
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`,
      'POST',
      {
        id: fieldId,
        event,
      },
    );
  }

  async updateIssueStarred(issueId: string, hasStar: boolean): Promise<{id: string}> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/watchers`,
      'POST',
      {
        hasStar,
      },
    );
  }

  async updateIssueVoted(issueId: string, hasVote: boolean): Promise<{id: string}> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/voters`,
      'POST',
      {
        hasVote,
      },
    );
  }

  async updateProject(issueId: string, project: Project) {
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}`,
      'POST',
      {
        id: issueId,
        project,
      },
    );
  }

  getVisibilityOptions = async (
    issueId: string,
    prefix: string = '',
    skip: number = 0,
    top: number = 20
  ): Promise<{
    groupsWithoutRecommended: UserGroup[];
    recommendedGroups: UserGroup[];
    visibilityGroups: UserGroup[];
    visibilityUsers: User[];
  }> => {
    const queryString = qs.stringify({
      $top: 50,
      fields: issueFields.getVisibility.toString(),
    });
    const url = `${this.youTrackUrl}/api/visibilityGroups?${queryString}`;
    const visibilityOptions = await this.makeAuthorizedRequest(url, 'POST', {
      issues: [
        {
          id: issueId,
        },
      ],
      prefix,
      skip,
      top,
    });
    return ApiHelper.patchAllRelativeAvatarUrls(visibilityOptions, this.config.backendUrl);
  };

  async getMentionSuggests(
    issueIds: string[],
    query: string,
  ) {
    const $top = 10;
    const fields = 'issues(id),users(id,login,fullName,avatarUrl)';
    const queryString = qs.stringify({
      $top,
      fields,
      query,
    });
    const suggestions = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/mention?${queryString}`,
      'POST',
      {
        issues: issueIds.map(id => ({id}))
      },
    );
    return ApiHelper.patchAllRelativeAvatarUrls(
      suggestions,
      this.config.backendUrl,
    );
  }

  async getActivitiesPage(
    issueId: string,
    sources: string[],
  ): Promise<Array<Activity>> {
    const categoryKey = 'categories=';
    const categories = `${categoryKey}${(sources || []).join(',')}`;
    const queryString = qs.stringify({
      $top: 100,
      reverse: true,
    });
    const fields: string = this.isModernGAP
      ? issueActivitiesFields
      : ApiHelper.toField({
          activities: ISSUE_ACTIVITIES_FIELDS_LEGACY,
        }).toString();
    const response = await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/activitiesPage?${categories}&${queryString}&fields=${fields}`,
    );
    return ApiHelper.patchAllRelativeAvatarUrls(
      response.activities,
      this.config.backendUrl,
    );
  }

  removeIssueEntity(
    resourceName: string,
    issueId: string,
    entityId: string,
  ) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/${resourceName}/${entityId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  removeTag(issueId: string, tagId: string) {
    return this.removeIssueEntity('tags', issueId, tagId);
  }

  removeAttachment(issueId: string, attachmentId: string) {
    return this.removeIssueEntity('attachments', issueId, attachmentId);
  }

  addTags(issueId: string, tags: Tag[]) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?${ApiBase.createFieldsQuery({
        tags: issueFields.ISSUE_TAGS_FIELDS,
      })}`,
      'POST',
      {
        tags,
      },
    );
  }

  async timeTracking(issueId: string) {
    return this.makeAuthorizedRequest(
      `${
        this.youTrackIssueUrl
      }/${issueId}/timeTracking?${ApiBase.createFieldsQuery(
        issueFields.timeTracking,
      )}`,
      'GET',
    );
  }

  async updateDraftWorkItem(
    issueId: string,
    draft: Partial<WorkItem>,
  ): Promise<WorkItem> {
    return this.makeAuthorizedRequest(
      `${
        this.youTrackIssueUrl
      }/${issueId}/timeTracking/draftWorkItem?${ApiBase.createFieldsQuery(
        issueFields.workItems,
      )}`,
      draft.id ? 'POST' : 'PUT',
      draft,
    );
  }

  async submitWorkItem(issueId: string, draft: WorkItem | DraftWorkItem): Promise<WorkItem> {
    const query = `${ApiBase.createFieldsQuery(issueFields.workItems)}`;
    const id = draft.$type ? (draft as WorkItem).id : '';
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/workItems/${id}?${query}`,
      'POST',
      draft,
    );
  }

  async deleteWorkItem(issueId: string, workItemId: string = '') {
    return this.makeAuthorizedRequest(
      `${
        this.youTrackIssueUrl
      }/${issueId}/timeTracking/workItems/${workItemId}?${ApiBase.createFieldsQuery(
        issueFields.workItems,
      )}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async deleteDraftWorkItem(issueId: string) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/draftWorkItem`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async updateDescriptionCheckbox(
    issueId: string,
    checked: boolean,
    position: number,
  ): Promise<{
    text: string;
    updated: number;
    description: string;
  }> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}?fields=updated,description`,
      'POST',
      {
        checkboxes: [
          {
            checked,
            position,
          },
        ],
      },
    );
  }

  async updateCommentCheckbox(
    issueId: string,
    checked: boolean,
    position: number,
    comment: IssueComment,
  ) {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/comments/${
        comment.id
      }?${ApiBase.createFieldsQuery(['text', 'updated', 'description'])}`,
      'POST',
      {
        checkboxes: [
          {
            checked,
            position,
          },
        ],
        text: comment.text,
      },
    );
  }

  async getUsersCC(issueId: string): Promise<Array<UserCC>> {
    const q = qs.stringify({fields: issueFields.ISSUE_USER_CC_FIELDS.toString()});
    return await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/issues/${issueId}/helpdesk/ticketCCUsers?${q}`,
      'GET',
    );
  }

  async setUsersCC(issueId: string, ticketCCUsers: UserCC[]): Promise<Array<UserCC>> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/issues/${issueId}/helpdesk`,
      'POST',
      {ticketCCUsers},
    );
  }

  async getUsersCCSuggest(query: string): Promise<Array<UserCC>> {
    const q = qs.stringify({
      fields: issueFields.ISSUE_USER_CC_FIELDS.toString(),
      query: query.length ? query : undefined,
      banned: false,
      permission: 'JetBrains.YouTrack.READ_ISSUE',
    });
    const users: UserCC[] = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/users?${q}`,
      'GET',
    );
    return ApiHelper.convertAttachmentRelativeToAbsURLs(
      users,
      this.config.backendUrl,
    );
  }

  async getIssueSprints(issueId: string): Promise<IssueSprint[]> {
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/issues/${issueId}/sprints?fields=id,name,agile(id,name)`);
  }
}

