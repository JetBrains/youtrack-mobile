import {Clipboard} from 'react-native';

import * as activityHelper from './issue-activity__helper';
import * as types from '../issue-action-types';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUE_PAGE} from 'components/analytics/analytics-ids';
import {confirmation} from 'components/confirmation/confirmation';
import {convertCommentsToActivityPage, findActivityInGroupedActivities} from 'components/activity/activity-helper';
import {
  createIssueActivityActions,
  receiveActivityAPIAvailability,
  receiveActivityPage,
} from './issue-activity__actions';
import {DEFAULT_ISSUE_STATE_FIELD_NAME} from '../issue-base-actions-creater';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from 'components/notification/notification';
import {until} from 'util/util';
import {updateActivityCommentReactions} from 'components/activity-stream/activity__stream-helper';

import type Api from 'components/api/api';
import type IssueAPI from 'components/api/api__issue';
import type {Activity, ActivityPositionData} from 'types/Activity';
import type {AnyError} from 'types/Error';
import type {IssueComment} from 'types/CustomFields';
import type {IssueFull} from 'types/Issue';
import type {Reaction} from 'types/Reaction';
import type {State as SingleIssueState} from '../issue-reducers';
import type {UserGroup} from 'types/UserGroup';
import type {User, UserMentions} from 'types/User';
import type {ActivityGroup} from 'types/Activity';
import type {AppState} from 'reducers';
import type {IssueState} from '../issue-base-reducer';
import type {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

export function updateComment(comment: IssueComment): {
  comment: IssueComment;
  type: string;
} {
  return {
    type: types.RECEIVE_UPDATED_COMMENT,
    comment,
  };
}

export function deleteCommentFromList(
  comment: IssueComment,
  activityId?: string
): {
  activityId: void | string;
  comment: IssueComment;
  type: any;
} {
  return {
    type: types.DELETE_COMMENT,
    comment,
    activityId,
  };
}

export function startLoadingCommentSuggestions(): {
  type: any;
} {
  return {
    type: types.START_LOADING_COMMENT_SUGGESTIONS,
  };
}

export function stopLoadingCommentSuggestions(): {
  type: any;
} {
  return {
    type: types.STOP_LOADING_COMMENT_SUGGESTIONS,
  };
}

export function receiveCommentSuggestions(suggestions: Record<string, any>): {
  suggestions: any;
  type: any;
} {
  return {
    type: types.RECEIVE_COMMENT_SUGGESTIONS,
    suggestions,
  };
}

export interface CommentActions {
  deleteCommentPermanently: (comment: IssueComment, activityId?: string) => ReduxAction;
  getCommentVisibilityOptions: () => ReduxAction;
  loadActivity: (doNotReset?: boolean) => ReduxAction;
  deleteComment: (comment: IssueComment) => ReduxAction<Promise<unknown>>;
  onCheckboxUpdate: (checked: boolean, position: number, comment: IssueComment) => ReduxAction;
  loadIssueCommentsAsActivityPage: () => ReduxAction;
  submitEditedComment: (comment: IssueComment, isAttachmentChange?: boolean) => ReduxAction;
  copyCommentUrl: (id: string) => ReduxAction;
  toggleCommentDeleted: (
    comment: IssueComment,
    deleted: boolean
  ) => (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => Promise<void>;
  setEditingComment: (comment: IssueComment | {text: string; reply: boolean} | null) => ReduxAction;
  loadCommentSuggestions: (query: string) => ReduxAction<Promise<UserMentions>>;
  onReactionSelect: (
    issueId: string,
    comment: IssueComment,
    reaction: Reaction,
    activities: ActivityGroup[],
    onReactionUpdate: (activities: Activity[], error?: AnyError) => void
  ) => ReduxAction;
  updateDraftComment: (
    draftComment: IssueComment,
    doNotFlush?: boolean
  ) => (
    dispatch: ReduxThunkDispatch,
    getState: ReduxStateGetter,
    getApi: ReduxAPIGetter
  ) => Promise<IssueComment | null>;
  getDraftComment: () => ReduxAction<Promise<IssueComment | null>>;
  restoreComment: (comment: IssueComment) => ReduxAction;
  submitDraftComment: (draftComment: IssueComment) => ReduxAction;
}

export const createActivityCommentActions = (stateFieldName = DEFAULT_ISSUE_STATE_FIELD_NAME) => {
  const actions: CommentActions = {
    loadIssueCommentsAsActivityPage: function (): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const issueId = (getState()[stateFieldName as keyof AppState] as IssueState).issueId;
        const api: Api = getApi();

        try {
          const comments = await api.issue.getIssueComments(issueId);
          log.info(`Issue Activity: Loaded comments for an issue`);
          dispatch(receiveActivityAPIAvailability(false));
          const activityPage = convertCommentsToActivityPage(comments);
          dispatch(createIssueActivityActions(stateFieldName).receiveActivityEnabledTypes());
          dispatch(receiveActivityPage(activityPage));
        } catch (error) {
          dispatch({
            type: types.RECEIVE_COMMENTS_ERROR,
            error: error,
          });
          notifyError(error as AnyError);
        }
      };
    },
    loadActivity: function (doNotReset: boolean = false): ReduxAction {
      return async (dispatch: ReduxThunkDispatch) => {
        if (activityHelper.isIssueActivitiesAPIEnabled()) {
          dispatch(createIssueActivityActions(stateFieldName).loadActivitiesPage(doNotReset));
        } else {
          dispatch(actions.loadIssueCommentsAsActivityPage());
        }
      };
    },
    getDraftComment: (): ReduxAction<Promise<IssueComment | null>> =>
      async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const issueState: SingleIssueState = getState()[stateFieldName as keyof AppState] as IssueState;
        const issueId: string = issueState.issueId || issueState?.issue?.id;
        let draftComment: IssueComment | null = null;
        if (issueId) {
          try {
            draftComment = await getApi().issue.getDraftComment(issueId);
          } catch (error) {
            log.warn('Failed to receive issue comment draft', error);
          }
        }
        return draftComment;
      },
    updateDraftComment:
      (draftComment: IssueComment, doNotFlush: boolean = false): ReduxAction<Promise<null | IssueComment>> =>
      async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const issueState: SingleIssueState = getState()[stateFieldName as keyof AppState] as IssueState;
        const issueId = draftComment?.issue?.id || issueState?.issueId || issueState?.issue?.id;
        if (draftComment && issueId) {
          const [error, draft] = await until<IssueComment>(getApi().issue.updateDraftComment(issueId, draftComment));

          if (error) {
            log.warn('Failed to update a comment draft', error);
          } else if (!doNotFlush) {
            dispatch(actions.setEditingComment(draft));
          }

          return error ? null : draft;
        } else {
          return null;
        }
      },
    submitDraftComment: function (draftComment: IssueComment): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const issueId: string | undefined =
          draftComment?.issue?.id || (getState()[stateFieldName as keyof AppState] as IssueState)?.issue?.id;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Add comment', 'Success');

        if (draftComment && issueId) {
          const [error] = await until(getApi().issue.submitDraftComment(issueId, draftComment));

          if (error) {
            notifyError(error);
          } else {
            dispatch(actions.setEditingComment(null));
            dispatch(actions.loadActivity(true));
          }
        }
      };
    },
    setEditingComment: function (comment: (IssueComment | {text: string; reply: boolean}) | null): ReduxAction {
      return async (dispatch: ReduxThunkDispatch) => {
        dispatch({
          type: types.SET_EDITING_COMMENT,
          comment,
        });
      };
    },
    submitEditedComment: function (comment: IssueComment, isAttachmentChange: boolean = false): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const issue: IssueFull = (getState()[stateFieldName as keyof AppState] as IssueState).issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update comment');

        try {
          await getApi().issue.submitComment(issue.id, comment);
          log.info(`Issue Activity: Comment updated. Refreshing...`);

          if (isAttachmentChange) {
            notify(i18n('Comment updated'));
          }

          if (!isAttachmentChange) {
            await dispatch(actions.setEditingComment(null));
          }

          await dispatch(actions.loadActivity(true));
        } catch (error) {
          notifyError(error as AnyError);
        }
      };
    },
    toggleCommentDeleted: function (comment: IssueComment, deleted: boolean) {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const issueId = (getState()[stateFieldName as keyof AppState] as IssueState).issueId;

        try {
          const _comment: IssueComment = await getApi().issue.updateCommentDeleted(issueId, comment.id, deleted);
          dispatch(updateComment({...comment, ..._comment}));
          log.info(`Issue Activity: Comment deleted state updated: ${deleted.toString()}`);
        } catch (error) {
          dispatch(updateComment({...comment}));
          notifyError(error as AnyError);
        }
      };
    },
    deleteComment: function (comment: IssueComment): ReduxAction<Promise<unknown>> {
      return async (dispatch: ReduxThunkDispatch) => {
        return dispatch(actions.toggleCommentDeleted(comment, true));
      };
    },
    restoreComment: function (comment: IssueComment): ReduxAction {
      return async (dispatch: ReduxThunkDispatch) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Restore comment');
        return dispatch(actions.toggleCommentDeleted(comment, false));
      };
    },
    deleteCommentPermanently: function (comment: IssueComment, activityId?: string): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const issueId = (getState()[stateFieldName as keyof AppState] as IssueState).issueId;
        confirmation(i18n('Delete comment permanently?'), i18n('Delete'))
          .then(async () => {
            try {
              await getApi().issue.deleteCommentPermanently(issueId, comment.id);
              log.info(`Issue Activity: Comment deleted forever`);
              dispatch(deleteCommentFromList(comment, activityId));
              dispatch(actions.loadActivity());
            } catch (error) {
              dispatch(actions.loadActivity());
              notifyError(error as AnyError);
            }
          })
          .catch(() => {});
      };
    },
    copyCommentUrl: function (id: string): ReduxAction {
      return (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName as keyof AppState] as IssueState;
        Clipboard.setString(activityHelper.makeIssueWebUrl(api, issue, id));
        notify(i18n('Link to comment copied'));
      };
    },
    loadCommentSuggestions: function (query: string): ReduxAction<Promise<UserMentions>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const api: Api = getApi();
        const issue: IssueFull = (getState()[stateFieldName as keyof AppState] as IssueState).issue;
        dispatch(startLoadingCommentSuggestions());

        try {
          const suggestions = await api.mentions.getMentions(query, {
            issues: [
              {
                id: issue.id,
              },
            ],
          });
          dispatch(receiveCommentSuggestions(suggestions));
          return suggestions;
        } catch (error) {
          notifyError(error as AnyError);
          return {users: []};
        } finally {
          dispatch(stopLoadingCommentSuggestions());
        }
      };
    },
    getCommentVisibilityOptions: function (): ReduxAction {
      return (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter
      ): Promise<Array<User | UserGroup>> => {
        const api: Api = getApi();
        const issueId: string = (getState()[stateFieldName as keyof AppState] as IssueState).issue.id;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Open comment visibility select');
        return api.issue.getVisibilityOptions(issueId);
      };
    },
    onReactionSelect: function (
      issueId: string,
      comment: IssueComment,
      reaction: Reaction,
      activities: ActivityGroup[],
      onReactionUpdate: (activities: Activity[], error?: AnyError) => void
    ): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const issueApi: IssueAPI = getApi().issue;
        const currentUser: User = getState().app.user!;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Reaction select');
        const reactionName: string = reaction.reaction;
        const existReaction: Reaction = (comment.reactions || []).filter(
          it => it.reaction === reactionName && it.author.id === currentUser.id
        )[0];
        const [error, commentReaction] = await until(
          existReaction
            ? issueApi.removeCommentReaction(issueId, comment.id, existReaction.id)
            : issueApi.addCommentReaction(issueId, comment.id, reactionName)
        );

        if (error) {
          onReactionUpdate(activities, error);
          notifyError(error);
          return;
        }

        const targetActivityData: ActivityPositionData | null | undefined = findActivityInGroupedActivities(
          activities,
          comment.id
        );

        if (targetActivityData) {
          const _comment = updateActivityCommentReactions({
            comment,
            currentUser,
            reaction: existReaction ? reaction : commentReaction,
          });

          const newActivities: ActivityGroup[] = activities.slice(0);
          const targetActivity: ActivityGroup | undefined = newActivities[targetActivityData.index];
          if (targetActivity?.comment?.added) {
            targetActivity.comment.added = [_comment];
            onReactionUpdate(newActivities);
          }
        }
      };
    },
    onCheckboxUpdate: function (checked: boolean, position: number, comment: IssueComment): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName as keyof AppState] as IssueState;
        const [error, response] = await until(api.issue.updateCommentCheckbox(issue.id, checked, position, comment));

        if (!error && response) {
          dispatch(updateComment({...comment, text: response.text}));
        }
      };
    },
  };
  return actions;
};
