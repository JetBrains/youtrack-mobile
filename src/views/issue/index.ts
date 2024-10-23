import {DEFAULT_ISSUE_STATE_FIELD_NAME} from 'views/issue/issue-base-actions-creater';
import {isSplitView} from 'components/responsive/responsive-helper';
import {ISSUE_MODAL_STATE_FIELD_NAME} from 'views/issue/modal/issue.modal-actions';

import type {IssueState} from 'views/issue/issue-base-reducer';
import type {AppState} from 'reducers';

export const getIssueState = (state: AppState) =>
  state[isSplitView() ? ISSUE_MODAL_STATE_FIELD_NAME : DEFAULT_ISSUE_STATE_FIELD_NAME] as IssueState;
