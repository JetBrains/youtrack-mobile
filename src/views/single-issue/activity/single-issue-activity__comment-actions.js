/* @flow */

import {Clipboard, Alert} from 'react-native';
import * as types from '../single-issue-action-types';
import {notify} from '../../../components/notification/notification';
import log from '../../../components/log/log';
import {showActions} from '../../../components/action-sheet/action-sheet';
import usage from '../../../components/usage/usage';
import type {IssueFull} from '../../../flow/Issue';
import type {IssueComment} from '../../../flow/CustomFields';
import type Api from '../../../components/api/api';
import type {State as SingleIssueState} from '../single-issue-reducers';
import {getEntityPresentation} from '../../../components/issue-formatter/issue-formatter';
import IssueVisibility from '../../../components/visibility/issue-visibility';
import {
  loadActivitiesPage,
  receiveActivityAPIAvailability, receiveActivityEnabledTypes,
  receiveActivityPage
} from './single-issue-activity__actions';

import * as activityHelper from './single-issue-activity__helper';

import type {IssueActivity} from '../../../flow/Activity';
import type {State as IssueActivityState} from './single-issue-activity__reducers';
import type {State as IssueCommentActivityState} from './single-issue-activity__comment-reducers';

const CATEGORY_NAME = 'Issue';

type ApiGetter = () => Api;
type StateGetter = () => {
  issueActivity: IssueActivityState,
  issueCommentActivity: IssueCommentActivityState,
  singleIssue: SingleIssueState,
};

export function receiveComments(comments: Array<IssueComment>) {
  return {type: types.RECEIVE_COMMENTS, comments};
}

export function startSubmittingComment() {
  return {type: types.START_SUBMITTING_COMMENT};
}

export function startReply(targetLogin: string) {
  return {type: types.START_SUBMITTING_COMMENT, comment: `@${targetLogin} `};
}

export function setCommentText(comment: string) {
  return {type: types.SET_COMMENT_TEXT, comment};
}

export function stopSubmittingComment() {
  return {type: types.STOP_SUBMITTING_COMMENT};
}

export function updateComment(comment: IssueComment) {
  return {type: types.RECEIVE_UPDATED_COMMENT, comment};
}

export function deleteCommentFromList(comment: IssueComment, activityId?: string) {
  return {type: types.DELETE_COMMENT, comment, activityId};
}

export function startLoadingCommentSuggestions() {
  return {type: types.START_LOADING_COMMENT_SUGGESTIONS};
}

export function stopLoadingCommentSuggestions() {
  return {type: types.STOP_LOADING_COMMENT_SUGGESTIONS};
}

export function receiveCommentSuggestions(suggestions: Object) {
  return {type: types.RECEIVE_COMMENT_SUGGESTIONS, suggestions};
}

export function loadIssueCommentsAsActivityPage() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      const comments = await api.issue.getIssueComments(issueId);
      log.info(`Loaded ${comments.length} comments for ${issueId} issue`);
      dispatch(receiveActivityAPIAvailability(false));
      const activityPage = activityHelper.convertCommentsToActivityPage(comments);
      dispatch(receiveActivityEnabledTypes());
      dispatch(receiveActivityPage(activityPage));
    } catch (error) {
      dispatch({type: types.RECEIVE_COMMENTS_ERROR, error: error});
      notify('Failed to load comments. Try refresh', error);
    }
  };
}

export function loadActivity(doNotReset: boolean = false) {
  return async (dispatch: any => any) => {
    if (activityHelper.isActivitiesAPIEnabled()) {
      dispatch(loadActivitiesPage(doNotReset));
    } else {
      dispatch(loadIssueCommentsAsActivityPage());
    }
  };
}

export function addComment(comment: IssueComment) {
  return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issue.id;
    const activityPage: ?Array<IssueActivity> = getState().issueActivity.activityPage;
    dispatch(startSubmittingComment());

    try {
      await getApi().issue.submitComment(issueId, comment);
      usage.trackEvent(CATEGORY_NAME, 'Add comment', 'Success');
      log.info(`Comment created in issue ${issueId}. Reloading...`);
      dispatch(loadActivity(true));
    } catch (error) {
      dispatch(setCommentText(comment.text));
      activityPage && dispatch(receiveActivityPage(activityPage.filter(it => !it.tmp)));
      notify('Cannot create comment', error);
    } finally {
      dispatch(stopSubmittingComment());
    }
  };
}


export function startEditingComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch(setCommentText(comment.text));
    dispatch({type: types.SET_EDITING_COMMENT, comment});
  };
}

export function stopEditingComment() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch(setCommentText(''));
    dispatch({type: types.CLEAR_EDITING_COMMENT});
  };
}

export function submitEditedComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    dispatch(startSubmittingComment());

    try {
      const updatedComment = await getApi().issue.submitComment(issueId, comment);
      dispatch(stopEditingComment());
      dispatch(loadActivity());
      log.info(`Comment ${updatedComment.id} edited. Reloading...`);
      notify('Comment updated');
    } catch (error) {
      const errorMessage = 'Comment update failed';
      log.warn(errorMessage, error);
      notify(errorMessage, error);
    } finally {
      dispatch(stopSubmittingComment());
    }
  };
}

export function addOrEditComment(comment: IssueComment | null) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    const state = getState();
    const editingComment = state.issueCommentActivity.editingComment;

    if (!comment) {
      dispatch(stopSubmittingComment());
      return dispatch(stopEditingComment());
    }

    if (editingComment) {
      return dispatch(submitEditedComment({...editingComment, ...comment}));
    } else {
      return dispatch(addComment(comment));
    }
  };
}

function toggleCommentDeleted(comment: IssueComment, deleted: boolean) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    try {
      dispatch(
        updateComment({...comment, deleted})
      );
      await getApi().issue.updateCommentDeleted(issueId, comment.id, deleted);
      log.info(`Comment ${comment.id} deleted state updated: ${deleted.toString()}`);
    } catch (error) {
      dispatch(updateComment({...comment}));
      notify(`Failed to ${deleted ? 'delete' : 'restore'} comment`, error);
    }
  };
}

export function deleteComment(comment: IssueComment) {
  return async (dispatch: (any) => any) => {
    return dispatch(toggleCommentDeleted(comment, true));
  };
}

export function restoreComment(comment: IssueComment) {
  return async (dispatch: (any) => any) => {
    return dispatch(toggleCommentDeleted(comment, false));
  };
}

export function deleteCommentPermanently(comment: IssueComment, activityId?: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;

    try {
      await new Promise((resolve, reject) => {
        Alert.alert(
          'Confirmation',
          'Delete comment permanently?',
          [
            {text: 'Cancel', style: 'cancel', onPress: reject},
            {text: 'OK', onPress: resolve}
          ],
          {cancelable: true}
        );
      });
    } catch (error) {
      log.log('Deletion confirmation declined', error);
    }

    try {
      await getApi().issue.deleteCommentPermanently(issueId, comment.id);
      log.info(`Comment ${comment.id} deleted forever`);
      dispatch(deleteCommentFromList(comment, activityId));
      dispatch(loadActivity());
    } catch (error) {
      dispatch(loadActivity());
      notify(`Failed to delete comment. Refresh`, error);
    }
  };
}


export function copyCommentUrl(comment: IssueComment) {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    Clipboard.setString(makeIssueWebUrl(api, issue, comment.id));
    notify('Comment URL has been copied');
  };

  function makeIssueWebUrl(api: Api, issue: IssueFull, commentId: ?string) {
    const commentHash = commentId ? `#comment=${commentId}` : '';
    return `${api.config.backendUrl}/issue/${issue.idReadable}${commentHash}`;
  }
}

export function showIssueCommentActions(actionSheet: Object, comment: IssueComment) {
  return async (dispatch: (any) => any) => {

    const actions = [
      {
        title: 'Copy link',
        execute: () => {
          dispatch(copyCommentUrl(comment));
          usage.trackEvent(CATEGORY_NAME, 'Copy comment URL');
        }
      },
      {
        title: 'Edit',
        execute: () => {
          usage.trackEvent(CATEGORY_NAME, 'Edit comment');
          dispatch(startEditingComment(comment));
        }
      },
      {
        title: 'Delete',
        execute: () => {
          usage.trackEvent(CATEGORY_NAME, 'Delete comment');
          dispatch(deleteComment(comment));
        }
      },
      {title: 'Cancel'}
    ];

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function loadCommentSuggestions(query: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issue: IssueFull = getState().singleIssue.issue;
    dispatch(startLoadingCommentSuggestions());

    try {
      const suggestions = await api.issue.getMentionSuggests([issue.id], query);
      dispatch(receiveCommentSuggestions(suggestions));
    } catch (error) {
      notify('Failed to load comment suggestions', error);
    } finally {
      dispatch(stopLoadingCommentSuggestions());
    }
  };
}

export function receiveCommentVisibilityOptions() {
  return {type: types.RECEIVE_VISIBILITY_OPTIONS};
}

export function onOpenSelect(selectProps: Object) {
  return {type: types.OPEN_ISSUE_SELECT, selectProps};
}

export function onCloseSelect() {
  return {type: types.CLOSE_ISSUE_SELECT};
}

export function updateCommentWithVisibility(comment: IssueComment) {
  return {type: types.SET_COMMENT_VISIBILITY, comment};
}

export function onOpenCommentVisibilitySelect(comment: IssueComment) {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issueId: IssueFull = getState().singleIssue.issue.id;
    const selectedItems = [
      ...(comment?.visibility?.permittedGroups || []),
      ...(comment?.visibility?.permittedUsers || [])
    ];

    usage.trackEvent(CATEGORY_NAME, 'Open visibility select');
    dispatch(onOpenSelect({
      show: true,
      placeholder: 'Select user or group',
      dataSource: async () => {
        const options = await api.issue.getVisibilityOptions(issueId);
        dispatch(receiveCommentVisibilityOptions());
        return [...(options.visibilityGroups || []), ...(options.visibilityUsers || [])];
      },

      selectedItems: selectedItems,
      getTitle: item => getEntityPresentation(item),
      onSelect: (selectedOption) => {
        usage.trackEvent(CATEGORY_NAME, 'Visibility changed');
        comment = comment || {};
        comment.visibility = IssueVisibility.toggleOption(comment.visibility, selectedOption);
        dispatch(updateCommentWithVisibility(comment));
        dispatch(onCloseSelect());
      }
    }));
  };
}
