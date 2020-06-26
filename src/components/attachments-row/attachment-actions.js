/* @flow */

import attachFile from '../attach-file/attach-file';
import log from '../log/log';
import usage from '../usage/usage';
import {IconAttachment, IconCamera} from '../icon/icon';
import {notify} from '../notification/notification';
import {showActions} from '../action-sheet/action-sheet';
import {createAttachmentTypes} from './attachment-types';

// import * as types from './attachment-types';
import type Api from '../api/api';
import type {Attachment} from '../../flow/CustomFields';
import type {State as SingleIssueState} from '../../views/single-issue/single-issue-reducers';

const CATEGORY_NAME = 'Issue';

type ApiGetter = () => Api;
type StateGetter = () => { singleIssue: SingleIssueState };

const attachFileMethod: Object = {
  openCamera: 'openCamera',
  openPicker: 'openPicker'
};

export const getAttachmentActions = (prefix: string) => {
  const types: Object = createAttachmentTypes(prefix);

  return {
    toggleAttachFileDialog: function (isAttachFileDialogVisible: boolean = false) {
      return {type: types.ATTACH_TOGGLE_ADD_FILE_DIALOG, isAttachFileDialogVisible};
    },

    startImageAttaching: function (attachingImage: Object) {
      return {type: types.ATTACH_START_ADDING, attachingImage};
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

          log.info(`Image attached to issue ${issueId}`);
          usage.trackEvent(CATEGORY_NAME, 'Attach image', 'Success');

          dispatch(this.stopImageAttaching());
          dispatch(this.toggleAttachFileDialog(false));

        } catch (error) {
          const message: string = 'Failed to attach file';
          log.warn(message, error);
          notify(message, error);
        }
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

    showAttachImageDialog: function (method: typeof attachFileMethod) {
      return async (dispatch: any => any) => {
        try {
          const attachingImage = await attachFile(method);
          if (attachingImage) {
            dispatch(this.startImageAttaching(attachingImage));
            dispatch(this.toggleAttachFileDialog(true));
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
          execute: () => dispatch(this.showAttachImageDialog(attachFileMethod.openPicker))
        },
        {
          title: 'Take a picture…',
          icon: IconCamera,
          execute: () => dispatch(this.showAttachImageDialog(attachFileMethod.openCamera))
        }
      ];
    },

    attachOrTakeImage: function (actionSheet: Object) {
      return async (dispatch: any => any) => {
        const actions = this.createAttachActions(dispatch).concat({title: 'Cancel'});

        const selectedAction = await showActions(actions, actionSheet);

        if (selectedAction && selectedAction.execute) {
          selectedAction.execute();
        }
      };
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

};
