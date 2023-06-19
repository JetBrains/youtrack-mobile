import attachFile from 'components/attach-file/attach-file';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {
  ANALYTICS_ARTICLE_PAGE,
  ANALYTICS_ARTICLE_PAGE_STREAM,
  ANALYTICS_ISSUE_PAGE,
  ANALYTICS_ISSUE_STREAM_SECTION,
} from 'components/analytics/analytics-ids';
import {attachmentActionMap, createAttachmentTypes} from './attachment-helper';
import {i18n} from 'components/i18n/i18n';
import {IconAttachment, IconCamera} from 'components/icon/icon';
import {logEvent} from 'components/log/log-helper';
import {notify, notifyError} from 'components/notification/notification';
import {hasType, ResourceTypes} from 'components/api/api__resource-types';
import {until} from 'util/util';

import ArticlesAPI from 'components/api/api__articles';
import IssueAPI from 'components/api/api__issue';
import type Api from 'components/api/api';
import type {ActionSheetAction} from 'types/Action';
import type {AppState} from 'reducers';
import type {Article} from 'types/Article';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {NormalizedAttachment} from 'types/Attachment';
import {CustomError} from 'types/Error';
import {IssueCreate, IssueFull} from 'types/Issue';
import {Visibility} from 'types/Visibility';

type ApiGetter = () => Api;

type StateGetter = () => AppState;
const attachFileMethod: Record<string, any> = {
  openCamera: 'openCamera',
  openPicker: 'openPicker',
};

const notifySuccessAttachmentDeletion: () => void = () =>
  notify(i18n('Attachment deleted'));

export type AttachmentActions = {
  toggleAttachFileDialog: (...args: any[]) => any;
  startImageAttaching: (...args: any[]) => any;
  cancelImageAttaching: (...args: any[]) => any;
  doRemoveAttach: (...args: any[]) => any;
  stopImageAttaching: (...args: any[]) => any;
  doUploadFile: (
    isArticle: boolean,
    files: NormalizedAttachment[],
    entity: IssueFull | Article | IssueCreate,
    comment?: IssueComment,
  ) => Promise<Attachment[]>;
  doUploadFileToComment: (
    isArticle: boolean,
    files: NormalizedAttachment[],
    entity: IssueFull | Article | IssueCreate,
    comment: IssueComment,
  ) => Promise<Attachment[]>;
  uploadFileToArticleComment: (...args: any[]) => any;
  removeAttachment: (...args: any[]) => any;
  removeArticleAttachment: (...args: any[]) => any;
  removeAttachmentFromIssueComment: (...args: any[]) => any;
  removeAttachmentFromArticleComment: (...args: any[]) => any;
  showAttachImageDialog: (...args: any[]) => any;
  createAttachActions: (...args: any[]) => any;
  loadIssueAttachments: (...args: any[]) => any;
};


export const getAttachmentActions = (prefix: string): AttachmentActions => {
  const types: Record<keyof typeof attachmentActionMap, string> = createAttachmentTypes(prefix);
  const actions: Record<string, any> = {
    toggleAttachFileDialog: function (
      isAttachFileDialogVisible: boolean = false,
    ) {
      return {
        type: types.ATTACH_TOGGLE_ADD_FILE_DIALOG,
        isAttachFileDialogVisible,
      };
    },
    startImageAttaching: function (attachingImage: Record<string, any>) {
      return {
        type: types.ATTACH_START_ADDING,
        attachingImage,
      };
    },
    cancelImageAttaching: function (attachingImage: Record<string, any>) {
      return {
        type: types.ATTACH_CANCEL_ADDING,
        attachingImage,
      };
    },
    doRemoveAttach: function (attachmentId: string) {
      return {
        type: types.ATTACH_REMOVE,
        attachmentId,
      };
    },
    stopImageAttaching: function () {
      return {
        type: types.ATTACH_STOP_ADDING,
      };
    },
    doUploadFile: function (
      isArticle: boolean = false,
      files: NormalizedAttachment[],
      entity: IssueFull | Article | IssueCreate,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const attachApi: ArticlesAPI | IssueAPI = isArticle ? api.articles : api.issue;
        const [error, addedAttachments]: [CustomError | null, Attachment[]] = await until(
          files.map((file: NormalizedAttachment) => attachApi.attachFile(entity.id, file)),
          true,
        ) as [CustomError | null, Attachment[]];

        if (error) {
          notifyError(error);
          return [];
        } else {
          log.info(`File attached to the ${isArticle ? 'Article' : 'Issue'} ${entity.id}`);
          usage.trackEvent(
            isArticle ? ANALYTICS_ARTICLE_PAGE : ANALYTICS_ISSUE_PAGE,
            'Attach image',
            'Success'
          );
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          const visibility: Visibility | undefined = files[0].visibility;
          if (visibility) {
            const [err, attachmentsWithVisibility]: [CustomError | null, Attachment[]] = await until(
              addedAttachments.map(
                (attach: Attachment) => (attachApi.updateAttachmentVisibility(
                  entity.id,
                  attach,
                  visibility,
                  hasType.articleDraft(entity)
                ))
              ),
              true,
            ) as [CustomError | null, Attachment[]];
            return err ? addedAttachments : attachmentsWithVisibility;
          } else {
            return addedAttachments;
          }
        }
      };
    }    ,
    doUploadFileToComment: function (
      isArticle: boolean = false,
      files: NormalizedAttachment[],
      entity: IssueFull | Article | IssueCreate,
      comment: IssueComment,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const attachApi: ArticlesAPI | IssueAPI = isArticle ? api.articles : api.issue;
        const isCommentDraft: boolean = hasType.commentDraft(comment);
        const [error, addedAttachments]: [CustomError | null, Attachment[]] = await until(
          files.map((file: NormalizedAttachment) => attachApi.attachFileToComment(
            entity.id,
            file,
            isCommentDraft ? undefined : comment.id
          )),
          true,
        ) as [CustomError | null, Attachment[]];

        if (error) {
          notifyError(error);
          return [];
        } else {
          log.info(`File attached to the ${isArticle ? 'Article' : 'Issue'} Comment ${entity.id}`);
          usage.trackEvent(
            isArticle ? ANALYTICS_ARTICLE_PAGE_STREAM : ANALYTICS_ISSUE_STREAM_SECTION,
            'Attach image',
            'Success'
          );
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          const visibility: Visibility | undefined = (
            files[0].visibility || (hasType.visibilityLimited(comment.visibility) ? comment.visibility : null)
          );
          if (visibility) {
            const [err, attachmentsWithVisibility]: [CustomError | null, Attachment[]] = await until(
              addedAttachments.map(
                (attach: Attachment) => {
                  return attachApi.updateCommentAttachmentVisibility(
                    entity.id, attach, visibility, isCommentDraft
                  );
                }
              ),
            ) as [CustomError | null, Attachment[]];
            if (!err) {
              const visibilityMap: Record<string, Visibility> = attachmentsWithVisibility.reduce(
                (akk, attach: Attachment) => ({
                  ...akk,
                  [attach.id]: attach.visibility,
                }), {});
              return addedAttachments.map((attach: Attachment) => {
                return Object.assign(
                  attach,
                  visibilityMap[attach.id] ? {visibility: visibilityMap[attach.id]} : {}
                );
              });
            }
          }
          return addedAttachments;
        }
      };
    },
    uploadFileToArticleComment: function (
      files: NormalizedAttachment[],
      comment: Partial<IssueComment>,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ): Promise<Attachment[]> => {
        logEvent({
          message: 'Attaching file to a comment',
          analyticsId: ANALYTICS_ARTICLE_PAGE_STREAM,
        });
        const api: Api = getApi();
        const entityId: string = getState().article.article.id;
        const isDraftComment: boolean = comment.$type === ResourceTypes.DRAFT_ARTICLE_COMMENT;
        const commentId: string | undefined = isDraftComment ? undefined : comment.id;
        const [error, addedAttachments]: [CustomError | null, Attachment[]] = await until(
          files.map((file: NormalizedAttachment) =>
            api.articles.attachFileToComment(
              entityId,
              file,
              commentId,
            ),
          ),
          true,
        ) as [CustomError | null, Attachment[]];

        if (error) {
          notifyError(error);
          return [];
        } else {
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          const visibility: Visibility | undefined = files[0].visibility;
          if (visibility) {
            const [err, attachmentsWithVisibility]: [CustomError | null, Attachment[]] = await until(
              addedAttachments.map(
                (attach: Attachment) => api.articles.updateAttachmentVisibility(entityId, attach, visibility)
              ),
              true,
            ) as [CustomError | null, Attachment[]];
            return err ? addedAttachments : attachmentsWithVisibility;
          } else {
            return addedAttachments;
          }
        }
      };
    },
    removeAttachment: function (
      attach: Attachment,
      issueId: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ): Promise<void> => {
        const api: Api = getApi();

        try {
          await api.issue.removeAttachment(issueId, attach.id);
          dispatch(actions.doRemoveAttach(attach.id));
          notifySuccessAttachmentDeletion();
        } catch (error) {
          notifyError(error);
        }
      };
    },
    removeArticleAttachment: function (
      attach: Attachment,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ): Promise<void> => {
        const api: Api = getApi();
        const article: Article = getState().article.article;
        const [error] = await until(
          api.articles.removeAttachment(article.id, attach.id),
        );

        if (error) {
          notifyError(error);
        } else {
          notifySuccessAttachmentDeletion();
          dispatch(actions.doRemoveAttach(attach.id));
        }
      };
    },
    removeAttachmentFromComment: function (
      apiResource: (...args: any[]) => any,
      attachId: string,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        try {
          await apiResource();
          dispatch(actions.doRemoveAttach(attachId));
          notifySuccessAttachmentDeletion();
        } catch (error) {
          notifyError(error);
        }
      };
    },
    removeAttachmentFromIssueComment: function (
      attach: Attachment,
      commentId?: string,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const issueId: string = getState().issueState.issue.id;
        await dispatch(
          actions.removeAttachmentFromComment(
            () =>
              api.issue.removeFileFromComment(issueId, attach.id, commentId),
            attach.id,
          ),
        );
      };
    },
    removeAttachmentFromArticleComment: function (
      attach: Attachment,
      commentId?: string,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const articleId: string = getState().article.article.id;
        await dispatch(
          actions.removeAttachmentFromComment(
            () =>
              api.articles.removeAttachmentFromComment(
                articleId,
                attach.id,
                commentId,
              ),
            attach.id,
          ),
        );
      };
    },
    showAttachImageDialog: function (method: typeof attachFileMethod) {
      return async (dispatch: (arg0: any) => any) => {
        try {
          const attachingImage = await attachFile(method);

          if (attachingImage) {
            dispatch(actions.startImageAttaching(attachingImage));
            dispatch(actions.toggleAttachFileDialog(true));
          }
        } catch (err) {
          notifyError(err);
        }
      };
    },
    createAttachActions: function (
      dispatch: (arg0: (...args: any[]) => any) => any,
    ): ActionSheetAction[] {
      return [
        {
          title: i18n('Choose from library…'),
          icon: IconAttachment,
          execute: () => {
            logEvent({
              message: 'Attach file from storage',
              analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
            });
            dispatch(
              actions.showAttachImageDialog(attachFileMethod.openPicker),
            );
          },
        },
        {
          title: i18n('Take a picture…'),
          icon: IconCamera,
          execute: () => {
            logEvent({
              message: 'Attach file via camera',
              analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
            });
            dispatch(
              actions.showAttachImageDialog(attachFileMethod.openCamera),
            );
          },
        },
      ];
    },
    loadIssueAttachments: function (issueId: string) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        if (!issueId) {
          return;
        }

        try {
          const attachments = await getApi().issue.getIssueAttachments(issueId);
          dispatch({
            type: types.ATTACH_RECEIVE_ALL_ATTACHMENTS,
            attachments,
          });
        } catch (error) {
          log.warn('Failed to load issue attachments', error);
        }
      };
    },
  };
  return actions;
};
