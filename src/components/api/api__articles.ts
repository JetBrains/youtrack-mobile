import qs from 'qs';
import ApiBase from './api__base';
import ApiHelper from './api__helper';
import {
  articleChildrenAndSubChildren,
  articleFields,
  articlesFields,
} from './api__articles-fields';
import {
  ISSUE_ATTACHMENT_FIELDS,
  issueActivitiesFields,
} from './api__activities-issue-fields';
import issueFields from './api__issue-fields';
import {activityArticleCategory} from '../activity/activity__category';

import type {Activity} from 'types/Activity';
import type {Article, ArticleDraft} from 'types/Article';
import type {Attachment, IssueComment} from 'types/CustomFields';
import {Visibility, VisibilityGroups} from 'types/Visibility';
import {NormalizedAttachment} from 'types/Attachment';


export default class ArticlesAPI extends ApiBase {
  articleFieldsQuery: string = ApiBase.createFieldsQuery(articleFields);
  categories: string[] = Object.keys(activityArticleCategory).map(
    (key: string) => activityArticleCategory[key],
  );
  commentFields: string = issueFields.issueComment.toString();
  articleCommentFieldsQuery: string = ApiBase.createFieldsQuery(
    this.commentFields,
  );
  currentUserAPIUrl: string = `${this.youTrackApiUrl}${this.isActualAPI ? '' : '/admin'}/users/me`;

  convertAttachmentsURL(attachments: Attachment[]): Attachment[] {
    return ApiHelper.convertAttachmentRelativeToAbsURLs(
      attachments,
      this.config.backendUrl,
    );
  }

  removeArticleEntity(
    resourceName: string,
    articleId: string,
    entityId: string,
  ): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/${resourceName}/${entityId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async getArticles(
    query: string | null = null,
    folder?: string,
    $top: number = 101,
    $skip: number = 0,
  ): Promise<Array<Article>> {
    const fields: string = ApiBase.createFieldsQuery(articlesFields, {
      $top,
      $skip,
      ...(folder ? {folder} : {}),
      query,
    });
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles?${fields}`,
    );
  }

  async getArticle(articleId: string): Promise<Article> {
    const article = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}?${this.articleFieldsQuery}`,
    );
    article.attachments = this.convertAttachmentsURL(article.attachments);
    return article;
  }

  async getArticleChildren(articleId: string): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}?${ApiBase.createFieldsQuery(
        articleChildrenAndSubChildren,
      )}`,
    );
  }

  async updateArticle(
    articleId: string,
    data: Record<string, any> | null = null,
    fields?: string,
  ): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}?${
        fields ? ApiBase.createFieldsQuery([fields]) : this.articleFieldsQuery
      }`,
      'POST',
      data,
    );
  }

  async getActivitiesPage(articleId: string): Promise<Activity[]> {
    const categories = `categories=${this.categories.join(',')}`;
    const queryString = qs.stringify({
      $top: 100,
      reverse: true,
    });
    const activityPage: Activity[] = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/activitiesPage?${categories}&${queryString}&fields=${issueActivitiesFields}`,
    );
    return ApiHelper.patchAllRelativeAvatarUrls(
      activityPage,
      this.config.backendUrl,
    );
  }

  async getArticleDrafts(original?: string): Promise<Array<ArticleDraft>> {
    const originalParam: string = `&original=${original || 'null'}`;
    const url: string = `${this.currentUserAPIUrl}/articleDrafts/?${this.articleFieldsQuery}${originalParam}&$top=1000`;
    const articleDrafts: ArticleDraft[] = await this.makeAuthorizedRequest(
      url,
      'GET',
    );
    return articleDrafts.map((it: ArticleDraft) => {
      it.attachments = this.convertAttachmentsURL(it.attachments);
      return it;
    });
  }

  async createArticleDraft(articleId?: string): Promise<ArticleDraft> {
    const draft: ArticleDraft = await this.makeAuthorizedRequest(
      `${this.currentUserAPIUrl}/articleDrafts?${this.articleFieldsQuery}`,
      'POST',
      articleId
        ? {
            originalArticle: {
              id: articleId,
            },
          }
        : {
            project: null,
            parentArticle: null,
            summary: '',
            content: '',
          },
    );
    return {
      ...draft,
      attachments: this.convertAttachmentsURL(draft.attachments),
    };
  }

  async createSubArticleDraft(article: Article): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.currentUserAPIUrl}/articleDrafts?${this.articleFieldsQuery}`,
      'POST',
      {
        content: '',
        summary: '',
        parentArticle: {
          id: article.id,
        },
        project: article.project,
        visibility: article.visibility,
      },
    );
  }

  async updateArticleDraft(articleDraft: Article): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.currentUserAPIUrl}/articleDrafts/${articleDraft.id}?${this.articleFieldsQuery}`,
      'POST',
      {
        content: articleDraft.content,
        parentArticle: articleDraft.parentArticle,
        project: articleDraft.project,
        summary: articleDraft.summary,
        visibility: articleDraft.visibility,
        attachments: articleDraft.attachments,
      },
    );
  }

  async publishArticleDraft(articleDraftId: string): Promise<Article> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/?draftId=${articleDraftId}&${this.articleFieldsQuery}`,
      'POST',
      {},
    );
  }

  async deleteArticle(articleId: string): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async deleteDraft(articleId: string): Promise<any> {
    return this.makeAuthorizedRequest(
      `${this.currentUserAPIUrl}/articleDrafts/${articleId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  getVisibilityOptions = async (articleId: string, url?: string): Promise<VisibilityGroups> => {
    const queryString = ApiBase.createFieldsQuery(
      issueFields.getVisibility.toString(),
      {
        $visibilityTop: 50,
        $visibilitySkip: 0,
      },
    );
    const requestURL: string = url || `${this.youTrackApiUrl}/articles/${articleId}/visibilityOptions`;
    return await this.makeAuthorizedRequest(
      `${requestURL}?${queryString}`,
      'GET',
    );
  };

  getDraftVisibilityOptions: (articleId: string) => Promise<VisibilityGroups> = async (
    articleId: string,
  ): Promise<VisibilityGroups> =>
    this.getVisibilityOptions(
      articleId,
      `${this.currentUserAPIUrl}/articleDrafts/${articleId}/visibilityOptions`,
    );

  async getCommentDraft(articleId: string): Promise<IssueComment | null> {
    const fields: string = ApiBase.createFieldsQuery({
      draftComment: this.commentFields,
    });
    const response: {
      draftComment: IssueComment | null;
    } = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/?${fields}`,
      'GET',
    );

    if (response?.draftComment?.attachments?.length) {
      response.draftComment.attachments = this.convertAttachmentsURL(
        response.draftComment.attachments,
      );
    }

    return response.draftComment;
  }

  async updateCommentDraft(
    articleId: string,
    comment: IssueComment,
  ): Promise<IssueComment | null> {
    const draftComment: IssueComment = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/draftComment?${this.articleCommentFieldsQuery}`,
      comment.id ? 'POST' : 'PUT',
      {...comment, usesMarkdown: true},
    );

    if (draftComment.attachments) {
      draftComment.attachments = this.convertAttachmentsURL(
        draftComment.attachments,
      );
    }

    return draftComment;
  }

  async submitCommentDraft(
    articleId: string,
    articleCommentDraftId: string,
  ): Promise<IssueComment> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/comments?draftId=${articleCommentDraftId}&${this.articleCommentFieldsQuery}`,
      'POST',
      {},
    );
  }

  async updateComment(
    articleId: string,
    comment: IssueComment,
  ): Promise<IssueComment> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/comments/${comment.id}?${this.articleCommentFieldsQuery}`,
      'POST',
      {...comment, usesMarkdown: true, visibility: comment.visibility || null},
    );
  }

  async deleteComment(
    articleId: string,
    commentId: string,
  ): Promise<IssueComment> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/articles/${articleId}/comments/${commentId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async deleteAttachment(
    articleId: string,
    attachmentId: string,
    url?: string,
  ): Promise<IssueComment> {
    return this.makeAuthorizedRequest(
      url ||
        `${this.youTrackApiUrl}/articles/${articleId}/attachments/${attachmentId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async deleteDraftAttachment(
    articleId: string,
    attachmentId: string,
  ): Promise<IssueComment> {
    const url: string = `${this.currentUserAPIUrl}/articleDrafts/${articleId}/attachments/${attachmentId}`;
    return this.deleteAttachment(articleId, attachmentId, url);
  }

  async getAttachments(articleId: string): Promise<Array<Attachment>> {
    const queryString = ApiBase.createFieldsQuery(ISSUE_ATTACHMENT_FIELDS);
    const attachments: Attachment[] = await this.makeAuthorizedRequest(
      `${this.currentUserAPIUrl}/articleDrafts/${articleId}/attachments?${queryString}`,
    );
    return this.convertAttachmentsURL(attachments);
  }

  attachFile = async (
    articleId: string,
    file: NormalizedAttachment,
  ): Promise<Attachment[]> => {
    return super.attachFile(
      `${this.currentUserAPIUrl}/articleDrafts/${articleId}`,
      file,
    );
  };

  removeAttachment(articleId: string, attachmentId: string): Promise<any> {
    return this.removeArticleEntity('attachments', articleId, attachmentId);
  }

  async removeAttachmentFromComment(
    articleId: string,
    attachmentId: string,
    commentId?: string,
  ): Promise<void> {
    const resourcePath: string = commentId
      ? `comments/${commentId}`
      : 'draftComment';
    return this.removeArticleEntity(
      `${resourcePath}/attachments`,
      articleId,
      attachmentId,
    );
  }

  async attachFileToComment(
    articleId: string,
    file: NormalizedAttachment,
    commentId?: string,
  ): Promise<Attachment[]> {
    return super.attachFileToComment(
      `${this.youTrackApiUrl}/articles/${articleId}`,
      file,
      commentId,
    );
  }

  async updateAttachmentVisibility(
    articleId: string,
    attachment: Attachment,
    visibility: Visibility,
    isArticleDraft?: boolean,
  ): Promise<Attachment> {
    const resourcePath: string = isArticleDraft ? `${this.isActualAPI ? '' : 'admin/'}users/me/articleDrafts` : `articles`;
    return await super.updateAttachmentVisibility(
      `${resourcePath}/${articleId}`,
      attachment,
      visibility
    );
  }

  async updateCommentAttachmentVisibility(
    articleId: string,
    attachment: Attachment,
    visibility: Visibility,
    isCommentDraft: boolean,
  ): Promise<Attachment> {
    return await super.updateAttachmentVisibility(
      `articles/${articleId}${isCommentDraft ? '/draftComment' : ''}`,
      attachment,
      visibility
    );
  }

  async addCommentReaction(
    articleId: string,
    commentId: string,
    reactionName: string,
  ): Promise<any> {
    const queryString = qs.stringify({
      fields: issueFields.reaction.toString(),
    });
    const url: string = `${this.youTrackApiUrl}/articles/${articleId}/comments/${commentId}/reactions?${queryString}`;
    return this.makeAuthorizedRequest(url, 'POST', {
      reaction: reactionName,
    });
  }

  async removeCommentReaction(
    articleId: string,
    commentId: string,
    reactionId: string,
  ): Promise<any> {
    const url: string = `${this.youTrackApiUrl}/articles/${articleId}/comments/${commentId}/reactions/${reactionId}`;
    return this.makeAuthorizedRequest(url, 'DELETE', null, {
      parseJson: false,
    });
  }
}
