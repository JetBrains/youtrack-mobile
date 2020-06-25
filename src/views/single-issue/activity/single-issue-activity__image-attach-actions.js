/* @flow */

import * as types from '../single-issue-action-types';
import {notify} from '../../../components/notification/notification';
import attachFile from '../../../components/attach-file/attach-file';
import log from '../../../components/log/log';
import {showActions} from '../../../components/action-sheet/action-sheet';
import usage from '../../../components/usage/usage';
import type Api from '../../../components/api/api';
import type {State as SingleIssueState} from '../single-issue-reducers';
import type {Attachment} from '../../../flow/CustomFields';
import {IconAttachment, IconCamera} from '../../../components/icon/icon';

const CATEGORY_NAME = 'Issue';

type ApiGetter = () => Api;
type StateGetter = () => { singleIssue: SingleIssueState };

const attachFileMethod: Object = {
  openCamera: 'openCamera',
  openPicker: 'openPicker'
};


export function toggleAttachFileDialog(isAttachFileDialogVisible: boolean = false) {
  return {type: types.TOGGLE_ATTACH_FILE_DIALOG, isAttachFileDialogVisible};
}

export function startImageAttaching(attachingImage: Object) {
  return {type: types.START_IMAGE_ATTACHING, attachingImage};
}

export function removeAttachingImage() {
  return {type: types.REMOVE_ATTACHING_IMAGE};
}

export function stopImageAttaching() {
  return {type: types.STOP_IMAGE_ATTACHING};
}

export function uploadFile(attach: Attachment) {
  return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    try {
      const response: Attachment = await api.issue.attachFile(issue.id, attach.url, attach.name);
      await api.issue.updateIssueAttachmentVisibility(issue.id, response[0].id, attach.visibility);

      log.info(`Image attached to issue ${issue.id}`);
      usage.trackEvent(CATEGORY_NAME, 'Attach image', 'Success');

      dispatch(stopImageAttaching());
      dispatch(toggleAttachFileDialog(false));

    } catch (err) {
      notify('Cannot attach file', err);
    }
  };
}

function showAttachImageDialog(method: typeof attachFileMethod) {
  return async (dispatch: any => any) => {
    try {
      const attachingImage = await attachFile(method);
      if (attachingImage) {
        dispatch(startImageAttaching(attachingImage));
        dispatch(toggleAttachFileDialog(true));
      }
    } catch (err) {
      notify('Can\'t add file', err);
    }
  };
}

export function createAttachActions(dispatch: (Function) => any): Array<Object> {
  return [
    {
      title: 'Choose from library…',
      icon: IconAttachment,
      execute: () => dispatch(showAttachImageDialog(attachFileMethod.openPicker))
    },
    {
      title: 'Take a picture…',
      icon: IconCamera,
      execute: () => dispatch(showAttachImageDialog(attachFileMethod.openCamera))
    }
  ];
}

export function attachOrTakeImage(actionSheet: Object) {
  return async (dispatch: any => any) => {
    const actions = createAttachActions(dispatch).concat({title: 'Cancel'});

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}
