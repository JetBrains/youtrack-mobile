import {DEFAULT_ISSUE_STATE_FIELD_NAME} from 'views/issue/issue-base-actions-creater';
import {isSplitView} from 'components/responsive/responsive-helper';
import {ISSUE_MODAL_STATE_FIELD_NAME} from 'views/issue/modal/issue.modal-actions';

import {issueModalActions} from 'views/issue/modal/issue.modal';
import {issueActions} from 'views/issue/issue';

import type {AppState} from 'reducers';
import type {IssueState} from 'views/issue/issue-base-reducer';

const getNamespace = () => (isSplitView() ? ISSUE_MODAL_STATE_FIELD_NAME : DEFAULT_ISSUE_STATE_FIELD_NAME);

export const getIssueState = (state: AppState) => state[getNamespace()] as IssueState;

export const getIssueActions = () => (isSplitView() ? issueModalActions : issueActions);
