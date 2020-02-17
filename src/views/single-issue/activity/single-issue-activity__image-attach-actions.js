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

export function startImageAttaching(attachingImage: Object) {
  return {type: types.START_IMAGE_ATTACHING, attachingImage};
}

export function removeAttachingImage() {
  return {type: types.REMOVE_ATTACHING_IMAGE};
}

export function stopImageAttaching() {
  return {type: types.STOP_IMAGE_ATTACHING};
}

function attachImage(method: 'openCamera' | 'openPicker') {
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

export function attachOrTakeImage(actionSheet: Object) {
  return async (dispatch: any => any) => {
    const actions = [
      {
        title: 'Take a photo…',
        execute: () => dispatch(attachImage('openCamera'))
      },
      {
        title: 'Choose from library…',
        execute: () => dispatch(attachImage('openPicker'))
      },
      {title: 'Cancel'}
    ];

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}
