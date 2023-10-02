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
  CustomFieldText,
  FieldValue,
  IssueComment,
  IssueLink,
  IssueLinkType,
  IssueProject,
  Tag,
} from 'types/CustomFields';
import type {AnyIssue, IssueCreate, IssueFull} from 'types/Issue';
import type {Visibility} from 'types/Visibility';
import type {WorkItem} from 'types/Work';
import {NormalizedAttachment} from 'types/Attachment';

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
    return issue;
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

  async updateVisibility(
    issueId: string,
    visibility: Visibility | null,
  ): Promise<any> {
    const queryString = qs.stringify({
      fields:
        'id,visibility($type,permittedGroups($type,id,name),permittedUsers($type,id,name))',
    });
    const url = `${this.youTrackIssueUrl}/${issueId}?${queryString}`;
    return await this.makeAuthorizedRequest(url, 'POST', {
      visibility,
    });
  }

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

  async createIssue(issueDraft: Partial<IssueFull>): Promise<any> {
    const queryString = qs.stringify({
      draftId: issueDraft.id,
      fields: issueFields.issuesOnList.toString(),
    });
    return await this.makeAuthorizedRequest(
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
    value: FieldValue,
  ): Promise<any> {
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
  ): Promise<any> {
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
  ): Promise<any> {
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
  ): Promise<any> {
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
  ): Promise<any> {
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
  ): Promise<any> {
    const queryString = qs.stringify(
      {
        fields: issueFields.singleIssue.toString(),
      },
      {
        encode: false,
      },
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
  ): Promise<any> {
    const queryString = qs.stringify({
      fields: 'id,ringId,value',
    });
    const body = {
      id: fieldId,
      value,
    };
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`,
      'POST',
      body,
    );
  }

  async updateIssueFieldEvent(
    issueId: string,
    fieldId: string,
    event: Record<string, any>,
  ): Promise<any> {
    const queryString = qs.stringify({
      fields: 'id,ringId,value',
    });
    const body = {
      id: fieldId,
      event,
    };
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}?${queryString}`,
      'POST',
      body,
    );
  }

  async updateIssueStarred(issueId: string, hasStar: boolean): Promise<any> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/watchers`,
      'POST',
      {
        hasStar,
      },
    );
  }

  async updateIssueVoted(issueId: string, hasVote: boolean): Promise<any> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/voters`,
      'POST',
      {
        hasVote,
      },
    );
  }

  async updateProject(issue: AnyIssue, project: IssueProject): Promise<any> {
    const body = {
      id: issue.id,
      project: project,
    };
    return await this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issue.id}`,
      'POST',
      body,
    );
  }

  getVisibilityOptions = async (issueId: string, prefix: string = '', skip: number = 0, top: number = 20): Promise<any> => {
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
    visibilityOptions.visibilityUsers = ApiHelper.convertRelativeUrls(
      visibilityOptions.visibilityUsers || [],
      'avatarUrl',
      this.config.backendUrl,
    );
    return visibilityOptions;
  };

  async getMentionSuggests(
    issueIds: string[],
    query: string,
  ): Promise<any> {
    const $top = 10;
    const fields = 'issues(id),users(id,login,fullName,avatarUrl)';
    const queryString = qs.stringify({
      $top,
      fields,
      query,
    });
    const body = {
      issues: issueIds.map(id => ({
        id,
      })),
    };
    const suggestions = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/mention?${queryString}`,
      'POST',
      body,
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
  ): any {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/${resourceName}/${entityId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  removeTag(issueId: string, tagId: string): any {
    return this.removeIssueEntity('tags', issueId, tagId);
  }

  removeAttachment(issueId: string, attachmentId: string): any {
    return this.removeIssueEntity('attachments', issueId, attachmentId);
  }

  addTags(issueId: string, tags: Tag[]): any {
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

  async timeTracking(issueId: string): Promise<any> {
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
    draft: WorkItem,
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

  async createWorkItem(issueId: string, draft: WorkItem): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackIssueUrl}/${issueId}/timeTracking/workItems/${
        draft.$type ? (draft.id as any) : ''
      }?${ApiBase.createFieldsQuery(
        issueFields.workItems,
        draft.$type
          ? null
          : {
              draftId: draft.id,
            },
      )}`,
      'POST',
      draft,
    );
  }

  async deleteWorkItem(issueId: string, workItemId: string = ''): Promise<any> {
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

  async deleteDraftWorkItem(issueId: string): Promise<any> {
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
    description: string,
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
        description,
      },
    );
  }

  async updateCommentCheckbox(
    issueId: string,
    checked: boolean,
    position: number,
    comment: IssueComment,
  ): Promise<any> {
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
}
