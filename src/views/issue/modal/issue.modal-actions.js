/* @flow */

import * as types from '../issue-action-types';
import {actions} from './issue.modal-reducers';
import {attachmentActions, attachmentTypes} from './issue.modal__attachment-actions-and-types';
import {createDispatchActions} from '../issue-actions-helper';
import {createActions} from '../issue-base-actions-creater';

export const ISSUE_MODAL_STATE_FIELD_NAME: string = 'issueModalState';

export const dispatchActions: any = createDispatchActions(
  actions,
  types.commandDialogTypes,
  attachmentActions,
  attachmentTypes,
);

export default (): any => createActions(dispatchActions, ISSUE_MODAL_STATE_FIELD_NAME);
