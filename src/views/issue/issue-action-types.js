/* @flow */

import {commandDialogActionMap} from 'components/command-dialog/command-dialog-action-types';
import {createCommandDialogTypeMap} from 'components/command-dialog/command-dialog-reducer';

export const commandDialogNamespace: string = 'issue';
export const commandDialogTypes: typeof commandDialogActionMap = createCommandDialogTypeMap(commandDialogNamespace);

export const RECEIVE_COMMENTS_ERROR = 'issue.RECEIVE_COMMENTS_ERROR';

export const DELETE_COMMENT = 'issue.DELETE_COMMENT';

export const OPEN_ISSUE_SELECT = 'issue.OPEN_ISSUE_SELECT';
export const CLOSE_ISSUE_SELECT = 'issue.CLOSE_ISSUE_SELECT';

export const SET_EDITING_COMMENT = 'issue.SET_EDITING_COMMENT';
export const RECEIVE_UPDATED_COMMENT = 'issue.RECEIVE_UPDATED_COMMENT';

export const ISSUE_UPDATED = 'issue.ISSUE_UPDATED';

export const START_LOADING_COMMENT_SUGGESTIONS = 'issue.START_LOADING_COMMENT_SUGGESTIONS';
export const STOP_LOADING_COMMENT_SUGGESTIONS = 'issue.STOP_LOADING_COMMENT_SUGGESTIONS';
export const RECEIVE_COMMENT_SUGGESTIONS = 'issue.RECEIVE_COMMENT_SUGGESTIONS';

export const LOADING_ACTIVITY_PAGE = 'issue.LOADING_ACTIVITY_PAGE';
export const RECEIVE_ACTIVITY_PAGE = 'issue.RECEIVE_ACTIVITY_PAGE';
export const RECEIVE_ACTIVITY_ERROR = 'issue.RECEIVE_ACTIVITY_ERROR';
export const RECEIVE_ACTIVITY_API_AVAILABILITY = 'issue.RECEIVE_ACTIVITY_API_AVAILABILITY';
export const RECEIVE_ACTIVITY_CATEGORIES = 'issue.RECEIVE_ACTIVITY_CATEGORIES';

export const RECEIVE_WORK_TIME_SETTINGS = 'issue.RECEIVE_WORK_TIME_SETTINGS';
