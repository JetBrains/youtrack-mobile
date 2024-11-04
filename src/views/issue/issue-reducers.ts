import {activityCategory} from 'components/activity/activity__category';
import {attachmentTypes} from './issue__attachment-actions-and-types';
import {commandDialogNamespace} from './issue-action-types';
import {
  createAttachmentReducer,
  createIssueReduxSlice,
  initialState,
} from './issue-base-reducer';
import {createCommandDialogReducers} from 'components/command-dialog/command-dialog-reducer';
import {ON_NAVIGATE_BACK} from 'actions/action-types';
import {routeMap} from 'app-routes';

import * as types from './issue-action-types';
import type {Activity} from 'types/Activity';
import type {IssueState} from './issue-base-reducer';

export {initialState}; //TODO

export const singleIssueNamespace = 'single';
const {actions, reducer} = createIssueReduxSlice(singleIssueNamespace, {
  ...createAttachmentReducer(attachmentTypes),
  ...createCommandDialogReducers(commandDialogNamespace),
  [ON_NAVIGATE_BACK]: (
    state: IssueState,
    action: {
      closingView: {
        routeName: string;
        params: {
          issueId?: string;
        };
      };
    },
  ): IssueState => {
    if (action.closingView.routeName === routeMap.Issue) {
      return state.unloadedIssueState ? state.unloadedIssueState : initialState;
    }

    return state;
  },
  //Tab comment counter
  [types.RECEIVE_ACTIVITY_PAGE]: (
    state: IssueState,
    action: {
      activityPage: Activity[];
    },
  ): IssueState => {
    const {activityPage} = action;

    if (!activityPage) {
      return state;
    }

    const commentsCounter: number = activityPage.filter((it: Activity) => {
      return it.category.id === activityCategory.COMMENT;
    }).length;
    return {...state, commentsCounter};
  },
});
export {actions};
export default reducer;
