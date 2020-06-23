/* @flow */

import * as types from '../single-issue-action-types';
import {notify} from '../../../components/notification/notification';
import attachFile from '../../../components/attach-file/attach-file';
import log from '../../../components/log/log';
import {showActions} from '../../../components/action-sheet/action-sheet';
import usage from '../../../components/usage/usage';
import type Api from '../../../components/api/api';
import type {State as SingleIssueState} from '../single-issue-reducers';

const CATEGORY_NAME = 'Issue';

type ApiGetter = () => Api;
type StateGetter = () => { singleIssue: SingleIssueState };

const attachFileMethod: Object = {
  openCamera: 'openCamera',
  openPicker: 'openPicker'
};


export function startImageAttaching(attachingImage: Object) {
  return {type: types.START_IMAGE_ATTACHING, attachingImage};
}

export function removeAttachingImage() {
  return {type: types.REMOVE_ATTACHING_IMAGE};
}

export function stopImageAttaching() {
  return {type: types.STOP_IMAGE_ATTACHING};
}

function attachImage(method: typeof attachFileMethod) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    try {
      const attachingImage = await attachFile(method);
      if (!attachingImage) {
        return;
      }
      dispatch(startImageAttaching(attachingImage));

      try {
        await api.issue.attachFile(issue.id, attachingImage.url, attachingImage.name);
        log.info(`Image attached to issue ${issue.id}`);
        usage.trackEvent(CATEGORY_NAME, 'Attach image', 'Success');
      } catch (err) {
        notify('Cannot attach file', err);
        dispatch(removeAttachingImage());
      }
      dispatch(stopImageAttaching());
    } catch (err) {
      notify('ImagePicker error', err);
    }
  };
}

export function createAttachActions(dispatch: (Function) => any): Array<Object> {
  return [
    {
      title: 'Add photo…',
      execute: () => dispatch(attachImage(attachFileMethod.openCamera))
    },
    {
      title: 'Add file from library…',
      execute: () => dispatch(attachImage(attachFileMethod.openPicker))
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
