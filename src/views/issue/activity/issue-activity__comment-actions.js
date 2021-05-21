/* @flow */

import {Clipboard} from 'react-native';

import * as activityHelper from './issue-activity__helper';
import log from '../../../components/log/log';
import usage from '../../../components/usage/usage';
import {ANALYTICS_ISSUE_PAGE, ANALYTICS_ISSUE_STREAM_SECTION} from '../../../components/analytics/analytics-ids';
import {confirmation} from '../../../components/confirmation/confirmation';
import {
  loadActivitiesPage,
  receiveActivityAPIAvailability,
  receiveActivityEnabledTypes,
  receiveActivityPage
} from './issue-activity__actions';
import {COMMENT_REACTIONS_SEPARATOR} from '../../../components/reactions/reactions';
import {getEntityPresentation} from '../../../components/issue-formatter/issue-formatter';
import {logEvent} from '../../../components/log/log-helper';
import {notify} from '../../../components/notification/notification';
import {showActions} from '../../../components/action-sheet/action-sheet';
import {until} from '../../../util/util';
import {
  convertCommentsToActivityPage,
  findActivityInGroupedActivities
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
import type {UserGroup} from '../../../flow/UserGroup';


type ApiGetter = () => Api;
type StateGetter = () => {
  issueActivity: IssueActivityState,
  issueCommentActivity: IssueCommentActivityState,
  issueState: SingleIssueState,
};

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

    try {
      await getApi().issue.submitComment(issueId, comment);
      usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Add comment', 'Success');
      log.info(`Comment created in issue ${issueId}. Reloading...`);
      dispatch(loadActivity(true));
    } catch (error) {
      activityPage && dispatch(receiveActivityPage(activityPage.filter(it => !it.tmp)));
      notify('Cannot create comment', error);
    }
  };
}

export function getDraftComment() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const {issue} = getState().issueState;
    const [error, draftComment] = await until(getApi().issue.getDraftComment(issue.id));
    if (!error && draftComment) {
      dispatch(setEditingComment(draftComment));
    }
    return draftComment;
  };
}

export function updateDraftComment(draftComment: IssueComment, doNotFlush: boolean = false) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    if (draftComment) {
      const {issue} = getState().issueState;
      const [error, draft] = await until(getApi().issue.updateDraftComment(issue.id, draftComment));
      if (error) {
        log.warn('Failed to update a comment draft', error);
      } else if (!doNotFlush) {
        dispatch(setEditingComment(draft));
      }
    }
  };
}

export function submitDraftComment(draftComment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const {issue} = getState().issueState;

    await dispatch(updateDraftComment(draftComment, true));
    const [error] = await until(getApi().issue.submitDraftComment(issue.id, draftComment));
    if (error) {
      const message: string = 'Failed to post a comment';
      log.warn(message, error);
      notify(message, error);
      logEvent({message, isError: true, analyticsId: ANALYTICS_ISSUE_STREAM_SECTION});
    } else {
      dispatch(setEditingComment(null));
    }
  };
}

export function setEditingComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch({type: types.SET_EDITING_COMMENT, comment});
  };
}

export function submitEditedComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issueId;
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update comment');

    try {
      const updatedComment = await getApi().issue.submitComment(issueId, comment);
      dispatch(loadActivity(true));
      log.info(`Comment ${updatedComment.id} edited. Reloading...`);
      notify('Comment posted');
    } catch (error) {
      const errorMessage = 'Comment update failed';
      log.warn(errorMessage, error);
      notify(errorMessage, error);
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
    usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Delete comment');
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
    usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Delete comment permanently');
    confirmation('Delete comment permanently?', 'Delete')
      .then(async () => {
        try {
          await getApi().issue.deleteCommentPermanently(issueId, comment.id);
          log.info(`Comment ${comment.id} deleted forever`);
          dispatch(deleteCommentFromList(comment, activityId));
          dispatch(loadActivity());
        } catch (error) {
          dispatch(loadActivity());
          notify(`Failed to delete comment. Refresh`, error);
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
  updateComment: ?(comment: IssueComment) => void,
  canDeleteComment: boolean
) {
  return async (dispatch: (any) => any) => {
    const actions = [
      {
        title: 'Copy URL',
        execute: () => {
          dispatch(copyCommentUrl(comment));
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy comment URL');
        }
      },
    ];
    if (typeof updateComment === 'function') {
      actions.push({
        title: 'Edit',
        execute: () => {
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Edit comment');
          updateComment && updateComment(comment);
        }
      });
    }
    if (canDeleteComment) {
      actions.push({
        title: 'Delete',
        execute: () => {
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Delete comment');
          dispatch(deleteComment(comment));
        }
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

export function getCommentVisibilityOptions() {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<Array<User | UserGroup>> => {
    const api: Api = getApi();
    const issueId: IssueFull = getState().issueState.issue.id;
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Open comment visibility select');
    return api.issue.getVisibilityOptions(issueId);
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
        text: response.text
      }));
    }
  };
}
