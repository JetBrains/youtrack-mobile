import attachFile from '../attach-file/attach-file';
import log from '../log/log';
import usage from '../usage/usage';
import {
  ANALYTICS_ISSUE_PAGE,
  ANALYTICS_ISSUE_STREAM_SECTION,
} from '../analytics/analytics-ids';
import {attachmentActionMap, createAttachmentTypes} from './attachment-helper';
import {i18n} from 'components/i18n/i18n';
import {IconAttachment, IconCamera} from '../icon/icon';
import {logEvent} from '../log/log-helper';
import {notify, notifyError} from '../notification/notification';
import {ResourceTypes} from '../api/api__resource-types';
import {until} from 'util/util';
import type Api from '../api/api';
import type {ActionSheetAction} from 'types/Action';
import type {AppState} from '../../reducers';
import type {Article} from 'types/Article';
import type {Attachment, IssueComment} from 'types/CustomFields';
import type {NormalizedAttachment} from 'types/Attachment';
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
  uploadFile: (...args: any[]) => any;
  uploadFileToComment: (...args: any[]) => any;
  uploadFileToIssueComment: (...args: any[]) => any;
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
  const types: typeof attachmentActionMap = createAttachmentTypes(prefix);
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
    uploadFile: function (
      files: NormalizedAttachment[],
      issueId?: string,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const entityId: string = issueId || getState().issueState.issue.id;
        const [error, addedAttachments] = await until(
          files.map((attach: Attachment) =>
            api.issue.attachFile(
              entityId,
              attach.url,
              attach.name,
              attach.mimeType,
            ),
          ),
          true,
        );

        if (error) {
          notifyError(error);
          return [];
        } else {
          log.info(`File attached to issue ${entityId}`);
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Attach image', 'Success');
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          return addedAttachments;
        }
      };
    },
    uploadFileToIssueComment: function (
      files: NormalizedAttachment[],
      comment: Partial<IssueComment>,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ): Promise<Array<Attachment>> => {
        logEvent({
          message: 'Attaching file to a comment',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const api: Api = getApi();
        const issueId: string = comment?.issue?.id || getState().issueState.issue.id;
        const isDraftComment: boolean = comment.$type === ResourceTypes.DRAFT_ISSUE_COMMENT;
        const [error, attachments] = await until(
          files.map((attach: Attachment) =>
            api.issue.attachFileToComment(
              issueId,
              attach.url,
              attach.name,
              isDraftComment ? undefined : comment.id,
              attach.mimeType,
              comment.visibility,
            ),
          ),
          true,
        );

        if (error) {
          notifyError(error);
          return [];
        } else {
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          return attachments;
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
      ): Promise<Array<Attachment>> => {
        logEvent({
          message: 'Attaching file to a comment',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
        });
        const api: Api = getApi();
        const articleId: string = getState().article.article.id;
        const isDraftComment: boolean =
          comment.$type === ResourceTypes.DRAFT_ARTICLE_COMMENT;
        const [error, attachments] = await until(
          files.map((attach: Attachment) =>
            api.articles.attachFileToComment(
              articleId,
              attach.url,
              attach.name,
              isDraftComment ? undefined : comment.id,
              attach.mimeType,
            ),
          ),
          true,
        );

        if (error) {
          notifyError(error);
          return [];
        } else {
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          return attachments;
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
