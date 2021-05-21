/* @flow */

import attachFile from '../attach-file/attach-file';
import log from '../log/log';
import usage from '../usage/usage';
import {ANALYTICS_ISSUE_PAGE, ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {createAttachmentTypes} from './attachment-types';
import {IconAttachment, IconCamera} from '../icon/icon';
import {logEvent} from '../log/log-helper';
import {notify} from '../notification/notification';
import {until} from '../../util/util';

import type Api from '../api/api';
import type {Attachment} from '../../flow/CustomFields';
import type {State as IssueState} from '../../views/issue/issue-reducers';

type ApiGetter = () => Api;
type StateGetter = () => { issueState: IssueState };

const attachFileMethod: Object = {
  openCamera: 'openCamera',
  openPicker: 'openPicker'
};

export const getAttachmentActions = (prefix: string) => {
  const types: Object = createAttachmentTypes(prefix);

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

    doRemoveAttach: (attachmentId: string) => {
      return {type: types.ATTACH_REMOVE, attachmentId};
    },

    stopImageAttaching: function (){
      return {type: types.ATTACH_STOP_ADDING};
    },

    uploadFile: function (attach: Attachment, issueId: string) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        try {
          const response: Attachment = await api.issue.attachFile(issueId, attach.url, attach.name);
          await api.issue.updateIssueAttachmentVisibility(issueId, response[0].id, attach.visibility);

          log.info(`File attached to issue ${issueId}`);
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Attach image', 'Success');

          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));

        } catch (error) {
          const message: string = 'Failed to attach file';
          log.warn(message, error);
          notify(message, error);
        }
      };
    },

    uploadFileToDraftComment: function (attach: Attachment) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        logEvent({
          message: 'Attaching file to a comment',
          analyticsId: ANALYTICS_ISSUE_STREAM_SECTION
        });
        const api: Api = getApi();
        const issueId: string = getState().issueState.issue.id;
        const [error, attachments] = await until(api.issue.attachFileToDraftComment(issueId, attach.url, attach.name));
        if (error) {
          const message: string = 'Failed to attach file to a comment';
          log.warn(message, error);
          notify(message, error);
        } else {
          dispatch(actions.stopImageAttaching());
          dispatch(actions.toggleAttachFileDialog(false));
          return attachments;
        }
        return null;
      };
    },

    removeAttachment: function (attach: Attachment, issueId: string) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        try {
          await api.issue.removeAttachment(issueId, attach.id);
          dispatch(this.doRemoveAttach(attach.id));
        } catch (error) {
          const message: string = 'Failed to remove attachment';
          log.warn(message, error);
          notify(message, error);
        }
      };
    },

    removeAttachmentFromDraftComment: function (attach: Attachment) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const issueId: string = getState().issueState.issue.id;
        try {
          await api.issue.removeFileFromDraftComment(issueId, attach.id);
          dispatch(this.doRemoveAttach(attach.id));
        } catch (error) {
          const message: string = 'Failed to remove attachment';
          log.warn(message, error);
          notify(message, error);
        }
      };
    },

    showAttachImageDialog: function (method: typeof attachFileMethod) {
      return async (dispatch: any => any) => {
        try {
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

    createAttachActions: function (dispatch: (Function) => any): Array<Object> {
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

    loadIssueAttachments: function(issueId: string) {
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
