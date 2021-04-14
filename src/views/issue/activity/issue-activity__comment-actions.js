/* @flow */

import {Clipboard} from 'react-native';

import * as activityHelper from './issue-activity__helper';
import IssueVisibility from '../../../components/visibility/issue-visibility';
import log from '../../../components/log/log';
import usage from '../../../components/usage/usage';
import {ANALYTICS_ISSUE_PAGE} from '../../../components/analytics/analytics-ids';
import {confirmation} from '../../../components/confirmation/confirmation';
import {
  loadActivitiesPage,
  receiveActivityAPIAvailability,
  receiveActivityEnabledTypes,
  receiveActivityPage,
} from './issue-activity__actions';
import {COMMENT_REACTIONS_SEPARATOR} from '../../../components/reactions/reactions';
import {getEntityPresentation} from '../../../components/issue-formatter/issue-formatter';
import {notify} from '../../../components/notification/notification';
import {showActions} from '../../../components/action-sheet/action-sheet';
import {until} from '../../../util/util';
import {
  convertCommentsToActivityPage,
  findActivityInGroupedActivities,
} from '../../../components/activity/activity-helper';

import * as types from '../issue-action-types';
import type Api from '../../../components/api/api';
import type IssueAPI from '../../../components/api/api__issue';
import type {ActivityItem, ActivityPositionData, Activity} from '../../../flow/Activity';
import type {CustomError} from '../../../flow/Error';
import type {IssueComment} from '../../../flow/CustomFields';
import type {IssueFull} from '../../../flow/Issue';
import type {Reaction} from '../../../flow/Reaction';
import type {State as IssueActivityState} from './issue-activity__reducers';
import type {State as IssueCommentActivityState} from './issue-activity__comment-reducers';
import type {State as SingleIssueState} from '../issue-reducers';
import type {User} from '../../../flow/User';


type ApiGetter = () => Api;
type StateGetter = () => {
  issueActivity: IssueActivityState,
  issueCommentActivity: IssueCommentActivityState,
  issueState: SingleIssueState,
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
    const issueId = getState().issueState.issueId;
    const api: Api = getApi();

    try {
      const comments = await api.issue.getIssueComments(issueId);
      log.info(`Loaded ${comments.length} comments for ${issueId} issue`);
      dispatch(receiveActivityAPIAvailability(false));
      const activityPage = convertCommentsToActivityPage(comments);
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
    if (activityHelper.isIssueActivitiesAPIEnabled()) {
      dispatch(loadActivitiesPage(doNotReset));
    } else {
      dispatch(loadIssueCommentsAsActivityPage());
    }
  };
}

export function addComment(comment: IssueComment) {
  return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issue.id;
    const activityPage: ?Array<Activity> = getState().issueActivity.activityPage;
    dispatch(startSubmittingComment());

    try {
      await getApi().issue.submitComment(issueId, comment);
      usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Add comment', 'Success');
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
    const issueId = getState().issueState.issueId;
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update comment');
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
    const issueId = getState().issueState.issueId;
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
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Restore comment');
    return dispatch(toggleCommentDeleted(comment, false));
  };
}

export function deleteCommentPermanently(comment: IssueComment, activityId?: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issueId;

    confirmation('Delete comment permanently?', 'Delete')
      .then(async () => {
        try {
          await getApi().issue.deleteCommentPermanently(issueId, comment.id);
          log.info(`Comment ${comment.id} deleted forever`);
          dispatch(deleteCommentFromList(comment, activityId));
          dispatch(loadActivity());
        } catch (error) {
          dispatch(loadActivity());
          notify('Failed to delete comment. Refresh', error);
        }
      })
      .catch(() => {});
  };
}


export function copyCommentUrl(comment: IssueComment) {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().issueState;
    Clipboard.setString(makeIssueWebUrl(api, issue, comment.id));
    notify('Comment URL copied');
  };

  function makeIssueWebUrl(api: Api, issue: IssueFull, commentId: ?string) {
    const commentHash = commentId ? `#comment=${commentId}` : '';
    return `${api.config.backendUrl}/issue/${issue.idReadable}${commentHash}`;
  }
}

export function showIssueCommentActions(
  actionSheet: Object,
  comment: IssueComment,
  canUpdateComment: boolean,
  canDeleteComment: boolean
) {
  return async (dispatch: (any) => any) => {
    const actions = [
      {
        title: 'Copy URL',
        execute: () => {
          dispatch(copyCommentUrl(comment));
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy comment URL');
        },
      },
    ];
    if (canUpdateComment) {
      actions.push({
        title: 'Edit',
        execute: () => {
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Edit comment');
          dispatch(startEditingComment(comment));
        },
      });
    }
    if (canDeleteComment) {
      actions.push({
        title: 'Delete',
        execute: () => {
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Delete comment');
          dispatch(deleteComment(comment));
        },
      });
    }
    actions.push({title: 'Cancel'});

    const selectedAction = await showActions(
      actions,
      actionSheet,
      comment?.author ? getEntityPresentation(comment.author) : null,
      comment.text.length > 155 ? `${comment.text.substr(0, 153)}…` : comment.text
    );

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function loadCommentSuggestions(query: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issue: IssueFull = getState().issueState.issue;
    dispatch(startLoadingCommentSuggestions());

    try {
      const suggestions = await api.mentions.getMentions(query, {issues: [{id: issue.id}]});
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

export function onOpenSelect(selectProps: Object, isVisibilitySelectShown: boolean) {
  return {type: types.OPEN_ISSUE_SELECT, selectProps, isVisibilitySelectShown};
}

export function onCloseSelect(isVisibilitySelectShown: boolean) {
  return {type: types.CLOSE_ISSUE_SELECT, undefined, isVisibilitySelectShown};
}

export function updateCommentWithVisibility(comment: IssueComment) {
  return {type: types.SET_COMMENT_VISIBILITY, comment};
}

export function onOpenCommentVisibilitySelect(comment: IssueComment) {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issueId: IssueFull = getState().issueState.issue.id;
    const selectedItems = [
      ...(comment?.visibility?.permittedGroups || []),
      ...(comment?.visibility?.permittedUsers || []),
    ];

    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Open comment visibility select');
    dispatch(onOpenSelect({
      show: true,
      placeholder: 'Filter users, groups, and teams',
      dataSource: async () => {
        const options = await api.issue.getVisibilityOptions(issueId);
        dispatch(receiveCommentVisibilityOptions());
        return [...(options.visibilityGroups || []), ...(options.visibilityUsers || [])];
      },

      selectedItems: selectedItems,
      getTitle: item => getEntityPresentation(item),
      onSelect: (selectedOption) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Comment visibility update');
        comment = comment || {};
        comment.visibility = IssueVisibility.toggleOption(comment.visibility, selectedOption);
        dispatch(updateCommentWithVisibility(comment));
        dispatch(onCloseSelect(false));
      },
    }, true));
  };
}

export function onReactionSelect(
  issueId: string,
  comment: IssueComment,
  reaction: Reaction,
  activities: Array<ActivityItem>,
  onReactionUpdate: (activities: Array<ActivityItem>, error?: CustomError) => void
) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueApi: IssueAPI = getApi().issue;
    //$FlowFixMe
    const currentUser: User = getState().app.user;
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Reaction select');

    const reactionName: string = reaction.reaction;
    const existReaction: Reaction = comment.reactions.filter(
      it => it.reaction === reactionName && it.author.id === currentUser.id)[0];

    const [error, commentReaction] = await until(
      existReaction
        ? issueApi.removeCommentReaction(issueId, comment.id, existReaction.id)
        : issueApi.addCommentReaction(issueId, comment.id, reactionName)
    );

    if (error) {
      const errorMsg: string = `Failed to update a reaction ${reaction?.reaction}`;
      log.warn(errorMsg);
      onReactionUpdate(activities, error);
      notify(errorMsg);
      return;
    }

    const targetActivityData: ?ActivityPositionData = findActivityInGroupedActivities(
      activities, comment.id
    );
    if (targetActivityData) {
      onReactionUpdate(updateActivities());
    }

    function updateActivities() {
      const targetComment: IssueComment = targetActivityData?.activity?.comment.added[0];
      if (existReaction) {
        const selectedReactionEntity: Reaction = targetComment.reactions.find(
          (it: Reaction) => it.reaction === reactionName && it?.author?.id === currentUser?.id
        );
        targetComment.reactions = targetComment.reactions.filter(
          (it: Reaction) => it?.id !== selectedReactionEntity?.id && selectedReactionEntity?.author?.id === currentUser?.id);

        if (!targetComment.reactions.some((it: Reaction) => it.reaction === reactionName)) {
          targetComment.reactionOrder = (targetComment.reactionOrder
            .split(COMMENT_REACTIONS_SEPARATOR)
            .filter((name: string) => name !== reactionName)
            .join(COMMENT_REACTIONS_SEPARATOR));
        }
      } else {
        targetComment.reactions.push(commentReaction);
        targetComment.reactionOrder = targetComment.reactionOrder || '';
        if (!(targetComment.reactionOrder).split(COMMENT_REACTIONS_SEPARATOR).some((it: string) => it === reactionName)) {
          targetComment.reactionOrder = `${targetComment.reactionOrder}|${reactionName}`;
        }
      }

      const newActivities: Array<ActivityItem> = activities.slice(0);
      const targetIndex: ?number = targetActivityData?.index;
      const targetActivity = targetIndex && newActivities[targetIndex];
      targetActivity && (targetActivity.comment.added[0] = targetComment);
      return newActivities;
    }
  };
}

export function onCheckboxUpdate(checked: boolean, position: number, comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().issueState;
    const [error, response] = await until(api.issue.updateCommentCheckbox(issue.id, checked, position, comment));
    if (!error && response) {
      dispatch(updateComment({
        ...comment,
        text: response.text,
      }));
    }
  };
}
