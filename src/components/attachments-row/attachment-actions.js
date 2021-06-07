/* @flow */

import attachFile from '../attach-file/attach-file';
import log from '../log/log';
import usage from '../usage/usage';
import {ANALYTICS_ISSUE_PAGE, ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {attachmentActionMap, createAttachmentTypes} from './attachment-types';
import {IconAttachment, IconCamera} from '../icon/icon';
import {logEvent} from '../log/log-helper';
import {notify} from '../notification/notification';
import {ResourceTypes} from '../api/api__resource-types';
import {until} from '../../util/util';

import type Api from '../api/api';
import type {ActionSheetAction} from '../../flow/Action';
import type {AppState} from '../../reducers';
import type {Article} from '../../flow/Article';
import type {Attachment, IssueComment} from '../../flow/CustomFields';

type ApiGetter = () => Api;
type StateGetter = () => AppState;

const attachFileMethod: Object = {
  openCamera: 'openCamera',
  openPicker: 'openPicker'
};
const notifySuccessAttachmentDeletion: () => void = () => notify('Attachment deleted');

export type AttachmentActions = {
  toggleAttachFileDialog: Function,
  startImageAttaching: Function,
  cancelImageAttaching: Function,
  doRemoveAttach: Function,
  stopImageAttaching: Function,
  uploadFile: Function,
  uploadFileToComment: Function,
  removeAttachment: Function,
  removeArticleAttachment: Function,
  removeAttachmentFromIssueComment: Function,
  removeAttachmentFromArticleComment: Function,
  showAttachImageDialog: Function,
  createAttachActions: Function,
  loadIssueAttachments: Function,
};

export const getAttachmentActions = (prefix: string) => {
  const types: typeof attachmentActionMap = createAttachmentTypes(prefix);

  const actions: Object = {
    toggleAttachFileDialog: function (isAttachFileDialogVisible: boolean = false) {
      return {type: types.ATTACH_TOGGLE_ADD_FILE_DIALOG, isAttachFileDialogVisible};
    },

    startImageAttaching: function (attachingImage: Object) {
      return {type: types.ATTACH_START_ADDING, attachingImage};
    },

    cancelImageAttaching: function (attachingImage: Object) {
      return {type: types.ATTACH_CANCEL_ADDING, attachingImage};
    },

    doRemoveAttach: function (attachmentId: string) {
      return {type: types.ATTACH_REMOVE, attachmentId};
    },

    stopImageAttaching: function () {
      return {type: types.ATTACH_STOP_ADDING};
    },

    uploadFile: function (attach: Attachment, issueId?: string) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const _issueId: string = issueId || getState().issueState.issue.id;

        dispatch(actions.startImageAttaching());
        const [error, addedAttachments] = await until(api.issue.attachFile(_issueId, attach.url, attach.name));

        if (error) {
          const message: string = 'Failed to attach file';
          log.warn(message, error);
          notify(message, error);
          return [];
        } else {
          await api.issue.updateIssueAttachmentVisibility(_issueId, addedAttachments[0].id, attach.visibility);

          log.info(`File attached to issue ${_issueId}`);
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Attach image', 'Success');

          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          return addedAttachments;
        }
      };
    },

    uploadFileToIssueComment: function (attach: Attachment, comment: $Shape<IssueComment>) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter): Promise<IssueComment> => {
        logEvent({
          message: 'Attaching file to a comment',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
        });
        const api: Api = getApi();
        const issueId: string = getState().issueState.issue.id;
        const isDraftComment: boolean = comment.$type === ResourceTypes.DRAFT_ISSUE_COMMENT;
        const [error, attachments] = await until(
          api.issue.attachFileToComment(issueId, attach.url, attach.name, isDraftComment ? undefined : comment.id)
        );
        if (error) {
          const message: string = 'Failed to attach file to a comment';
          log.warn(message, error);
          notify(message, error);
          return [];
        } else {
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          return attachments;
        }
      };
    },

    uploadFileToArticleComment: function (attach: Attachment, comment: $Shape<IssueComment>) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter): Promise<IssueComment> => {
        logEvent({
          message: 'Attaching file to a comment',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
        });
        const api: Api = getApi();
        const articleId: string = getState().article.article.id;
        const isDraftComment: boolean = comment.$type === ResourceTypes.DRAFT_ARTICLE_COMMENT;
        const [error, attachments] = await until(
          api.articles.attachFileToComment(
            articleId,
            attach.url,
            attach.name,
            isDraftComment ? undefined : comment.id
          )
        );
        if (error) {
          const message: string = 'Failed to attach file to a comment';
          log.warn(message, error);
          notify(message, error);
          return [];
        } else {
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          return attachments;
        }
      };
    },

    removeAttachment: function (attach: Attachment, issueId: string): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter): Promise<void> => {
        const api: Api = getApi();
        try {
          await api.issue.removeAttachment(issueId, attach.id);
          dispatch(actions.doRemoveAttach(attach.id));
          notifySuccessAttachmentDeletion();
        } catch (error) {
          const message: string = 'Failed to remove attachment';
          log.warn(message, error);
          notify(message, error);
        }
      };
    },

    removeArticleAttachment: function (attach: Attachment): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter): Promise<void> => {
        const api: Api = getApi();
        const article: Article = getState().article.article;
        const [error] = await until(api.articles.removeAttachment(article.id, attach.id));
        if (error) {
          const message: string = 'Failed to remove article attachment';
          log.warn(message, error);
          notify(message, error);
        } else {
          notifySuccessAttachmentDeletion();
          dispatch(actions.doRemoveAttach(attach.id));
        }
      };
    },

    removeAttachmentFromComment: function (apiResource: Function, attachId: string) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        try {
          await apiResource();
          dispatch(actions.doRemoveAttach(attachId));
          notifySuccessAttachmentDeletion();
        } catch (error) {
          const message: string = 'Failed to remove attachment';
          log.warn(message, error);
          notify(message, error);
        }
      };
    },

    removeAttachmentFromIssueComment: function (attach: Attachment, commentId?: string) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const issueId: string = getState().issueState.issue.id;
        dispatch(actions.removeAttachmentFromComment(
          () => api.issue.removeFileFromComment(issueId, attach.id, commentId),
          attach.id
        ));
      };
    },

    removeAttachmentFromArticleComment: function (attach: Attachment, commentId?: string) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const articleId: string = getState().article.article.id;
        dispatch(actions.removeAttachmentFromComment(
          () => api.articles.removeAttachmentFromComment(articleId, attach.id, commentId),
          attach.id
        ));
      };
    },

    showAttachImageDialog: function (method: typeof attachFileMethod) {
      return async (dispatch: any => any) => {
        try {
          dispatch(actions.startImageAttaching());
          const attachingImage = await attachFile(method);
          if (attachingImage) {
            dispatch(actions.startImageAttaching(attachingImage));
            dispatch(actions.toggleAttachFileDialog(true));
          }
        } catch (err) {
          notify('Can\'t add file', err);
        }
      };
    },

    createAttachActions: function (dispatch: (Function) => any): Array<ActionSheetAction> {
      return [
        {
          title: 'Choose from library…',
          icon: IconAttachment,
          execute: () => {
            logEvent({
              message: 'Attach file from storage',
              analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
            });
            dispatch(actions.showAttachImageDialog(attachFileMethod.openPicker));
          }
        },
        {
          title: 'Take a picture…',
          icon: IconCamera,
          execute: () => {
            logEvent({
              message: 'Attach file via camera',
              analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
            });
            dispatch(actions.showAttachImageDialog(attachFileMethod.openCamera));
          }
        }
      ];
    },

    loadIssueAttachments: function (issueId: string) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        if (!issueId) {
          return;
        }

        try {
          const attachments = await getApi().issue.getIssueAttachments(issueId);
          dispatch({
            type: types.ATTACH_RECEIVE_ALL_ATTACHMENTS,
            attachments
          });
        } catch (error) {
          log.warn('Failed to load issue attachments', error);
        }
      };
    }

  };

  return actions;

};
