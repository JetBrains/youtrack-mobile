/* @flow */

import {Slice} from '@reduxjs/toolkit';

import {attachmentTypes} from './issue.modal__attachment-actions-and-types';
import {commandDialogNamespace} from '../issue-action-types';
import {createCommandDialogReducers} from 'components/command-dialog/command-dialog-reducer';
import {ON_NAVIGATE_BACK} from 'actions/action-types';
import {routeMap} from '../../../app-routes';
import {
  createAttachmentReducer,
  createIssueReduxSlice,
  initialState,
} from '../issue-base-reducer';
import type {IssueState} from '../issue-base-reducer';

export type {IssueState as State}; //TODO
export {initialState}; //TODO

export const singleIssueNamespace = 'modal';

const {actions, reducer}: typeof Slice = createIssueReduxSlice(
  singleIssueNamespace,
  {
    ...createAttachmentReducer(attachmentTypes),
    ...createCommandDialogReducers(commandDialogNamespace),

    [ON_NAVIGATE_BACK]: (state: IssueState, action: { closingView: { routeName: string, params: { issueId?: string } } }): IssueState => {
      if (action.closingView.routeName === routeMap.Issue) {
        return state.unloadedIssueState ? state.unloadedIssueState : initialState;
      }
      return state;
    },
  }
);

export {actions};
export default reducer;
