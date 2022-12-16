/* @flow */

import * as types from './issue-action-types';
import {actions} from './issue-reducers';
import {attachmentActions, attachmentTypes} from './issue__attachment-actions-and-types';
import {createDispatchActions} from './issue-actions-helper';
import {createActions} from './issue-base-actions-creater';

export const dispatchActions = (createDispatchActions(
  actions,
  types.commandDialogTypes,
  attachmentActions,
  attachmentTypes
): any);

export default (): any => createActions(dispatchActions);
