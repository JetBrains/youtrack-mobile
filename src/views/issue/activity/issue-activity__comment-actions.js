/* @flow */

import {Clipboard} from 'react-native';

import * as activityHelper from './issue-activity__helper';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUE_PAGE} from 'components/analytics/analytics-ids';
import {confirmation} from 'components/confirmation/confirmation';
import {createIssueActivityActions, receiveActivityAPIAvailability, receiveActivityPage} from './issue-activity__actions';
import {COMMENT_REACTIONS_SEPARATOR} from 'components/reactions/reactions';
import {DEFAULT_ISSUE_STATE_FIELD_NAME} from '../issue-base-actions-creater';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {notify, notifyError} from 'components/notification/notification';
import {showActions} from 'components/action-sheet/action-sheet';
import {until} from 'util/util';
import {
  convertCommentsToActivityPage,
  findActivityInGroupedActivities,
} from 'components/activity/activity-helper';

import * as types from '../issue-action-types';
import type Api from 'components/api/api';
import type IssueAPI from 'components/api/api__issue';
import type {ActivityItem, ActivityPositionData} from 'flow/Activity';
import type {CustomError} from 'flow/Error';
import type {IssueComment} from 'flow/CustomFields';
import type {IssueFull} from 'flow/Issue';
import type {Reaction} from 'flow/Reaction';
import type {State as IssueActivityState} from './issue-activity__reducers';
import type {State as IssueCommentActivityState} from './issue-activity__comment-reducers';
import type {State as SingleIssueState} from '../issue-reducers';
import type {User} from 'flow/User';
import type {UserGroup} from 'flow/UserGroup';
import {i18n} from 'components/i18n/i18n';


type ApiGetter = () => Api;
type StateGetter = () => {
  issueActivity: IssueActivityState,
  issueCommentActivity: IssueCommentActivityState,
  issueState: SingleIssueState,
};

export function updateComment(comment: IssueComment): {comment: IssueComment, type: string} {
  return {type: types.RECEIVE_UPDATED_COMMENT, comment};
}

export function deleteCommentFromList(comment: IssueComment, activityId?: string): {activityId: void | string, comment: IssueComment, type: any} {
  return {type: types.DELETE_COMMENT, comment, activityId};
}

export function startLoadingCommentSuggestions(): {type: any} {
  return {type: types.START_LOADING_COMMENT_SUGGESTIONS};
}

export function stopLoadingCommentSuggestions(): {type: any} {
  return {type: types.STOP_LOADING_COMMENT_SUGGESTIONS};
}

export function receiveCommentSuggestions(suggestions: Object): {suggestions: any, type: any} {
  return {type: types.RECEIVE_COMMENT_SUGGESTIONS, suggestions};
}

export const createActivityCommentActions = (stateFieldName: string = DEFAULT_ISSUE_STATE_FIELD_NAME): any => {
  const actions = {
    loadIssueCommentsAsActivityPage: function loadIssueCommentsAsActivityPage(): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueId = getState()[stateFieldName].issueId;
        const api: Api = getApi();

        try {
          const comments = await api.issue.getIssueComments(issueId);
          log.info(`Loaded ${comments.length} comments for ${issueId} issue`);
          dispatch(receiveActivityAPIAvailability(false));
          const activityPage = convertCommentsToActivityPage(comments);
          dispatch(createIssueActivityActions(stateFieldName).receiveActivityEnabledTypes());
          dispatch(receiveActivityPage(activityPage));
        } catch (error) {
          dispatch({type: types.RECEIVE_COMMENTS_ERROR, error: error});
          notifyError(error);
        }
      };
    },

    loadActivity: function loadActivity(doNotReset: boolean = false): ((dispatch: (any) => any) => Promise<void>) {
      return async (dispatch: any => any) => {
        if (activityHelper.isIssueActivitiesAPIEnabled()) {
          dispatch(createIssueActivityActions(stateFieldName).loadActivitiesPage(doNotReset));
        } else {
          dispatch(actions.loadIssueCommentsAsActivityPage());
        }
      };
    },

    getDraftComment: function getDraftComment(): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueState: SingleIssueState = getState()[stateFieldName];
        const {issue} = issueState;
        if (issue && issue.id) {
          try {
            const draftComment: IssueComment = await getApi().issue.getDraftComment(issue.id);
            dispatch(actions.setEditingComment(draftComment));
          } catch (error) {
            log.warn('Failed to receive issue comment draft', error);
          }
        }
      };
    },

    updateDraftComment: function updateDraftComment(draftComment: IssueComment, doNotFlush: boolean = false): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<null | IssueComment>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<null | IssueComment> => {
        const {issue} = getState()[stateFieldName];
        if (draftComment && issue) {
          const [error, draft] = await until(getApi().issue.updateDraftComment(issue.id, draftComment));
          if (error) {
            log.warn('Failed to update a comment draft', error);
          } else if (!doNotFlush) {
            dispatch(actions.setEditingComment(draft));
          }
          return error ? null : draft;
        } else {
          return null;
        }
      };
    },

    submitDraftComment: function submitDraftComment(draftComment: IssueComment): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issue: IssueFull = getState()[stateFieldName].issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Add comment', 'Success');
        if (draftComment && issue) {
          const [error] = await until(getApi().issue.submitDraftComment(issue.id, draftComment));
          if (error) {
            notifyError(error);
          } else {
            dispatch(actions.setEditingComment(null));
            dispatch(actions.loadActivity(true));
          }
        }
      };
    },

    setEditingComment: function setEditingComment(comment: IssueComment | null): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {

        dispatch({type: types.SET_EDITING_COMMENT, comment});
      };
    },

    submitEditedComment: function submitEditedComment(comment: IssueComment, isAttachmentChange: boolean = false): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issue: IssueFull = getState()[stateFieldName].issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update comment');
        try {
          const updatedComment = await getApi().issue.submitComment(issue.id, comment);
          log.info(`Comment ${updatedComment.id} updated. Refreshing...`);
          if (isAttachmentChange) {
            notify(i18n('Comment updated'));
          }
          if (!isAttachmentChange) {
            await dispatch(actions.setEditingComment(null));
          }
          await dispatch(actions.loadActivity(true));
        } catch (error) {
          notifyError(error);
        }
      };
    },

    toggleCommentDeleted: function toggleCommentDeleted(comment: IssueComment, deleted: boolean) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueId = getState()[stateFieldName].issueId;
        try {
          dispatch(
            updateComment({...comment, deleted})
          );
          await getApi().issue.updateCommentDeleted(issueId, comment.id, deleted);
          log.info(`Comment ${comment.id} deleted state updated: ${deleted.toString()}`);
        } catch (error) {
          dispatch(updateComment({...comment}));
          notifyError(error);
        }
      };
    },

    deleteComment: function deleteComment(comment: IssueComment): ((dispatch: (any) => any) => Promise<mixed>) {
      return async (dispatch: (any) => any) => {
        return dispatch(actions.toggleCommentDeleted(comment, true));
      };
    },

    restoreComment: function restoreComment(comment: IssueComment): ((dispatch: (any) => any) => Promise<any>) {
      return async (dispatch: (any) => any) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Restore comment');
        return dispatch(actions.toggleCommentDeleted(comment, false));
      };
    },

    deleteCommentPermanently: function deleteCommentPermanently(comment: IssueComment, activityId?: string): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueId = getState()[stateFieldName].issueId;

        confirmation(i18n('Delete comment permanently?'), i18n('Delete'))
          .then(async () => {
            try {
              await getApi().issue.deleteCommentPermanently(issueId, comment.id);
              log.info(`Comment ${comment.id} deleted forever`);
              dispatch(deleteCommentFromList(comment, activityId));
              dispatch(actions.loadActivity());
            } catch (error) {
              dispatch(actions.loadActivity());
              notifyError(error);
            }
          })
          .catch(() => {});
      };
    },


    copyCommentUrl: function copyCommentUrl(comment: IssueComment): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => void) {
      return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        Clipboard.setString(makeIssueWebUrl(api, issue, comment.id));
        notify(i18n('Link to comment copied'));
      };

      function makeIssueWebUrl(api: Api, issue: IssueFull, commentId: ?string) {
        const commentHash = commentId ? `#comment=${commentId}` : '';
        return `${api.config.backendUrl}/issue/${issue.idReadable}${commentHash}`;
      }
    },

    showIssueCommentActions: function showIssueCommentActions(
      actionSheet: Object,
      comment: IssueComment,
      updateComment: ?(comment: IssueComment) => void,
      canDeleteComment: boolean
    ): ((dispatch: (any) => any) => Promise<void>) {
      return async (dispatch: (any) => any) => {
        const contextActions = [
          {
            title: i18n('Copy text'),
            execute: () => {
              Clipboard.setString(comment.text);
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy comment text');
              notify(i18n('Copied'));
            },
          },
          {
            title: i18n('Copy link'),
            execute: () => {
              dispatch(actions.copyCommentUrl(comment));
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy comment URL');
            },
          },
        ];
        if (typeof updateComment === 'function') {
          contextActions.push({
            title: i18n('Edit'),
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Edit comment');
              updateComment(comment);
            },
          });
        }
        if (canDeleteComment) {
          contextActions.push({
            title: i18n('Delete'),
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Delete comment');
              dispatch(actions.deleteComment(comment));
            },
          });
        }
        contextActions.push({title: i18n('Cancel')});

        const selectedAction = await showActions(
          contextActions,
          actionSheet,
          comment?.author ? getEntityPresentation(comment.author) : null,
          comment.text.length > 155 ? `${comment.text.substr(0, 153)}…` : comment.text
        );

        if (selectedAction && selectedAction.execute) {
          selectedAction.execute();
        }
      };
    },

    loadCommentSuggestions: function loadCommentSuggestions(query: string): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<Array<User>> => {
        const api: Api = getApi();
        const issue: IssueFull = getState()[stateFieldName].issue;
        dispatch(startLoadingCommentSuggestions());

        try {
          const suggestions = await api.mentions.getMentions(query, {issues: [{id: issue.id}]});
          dispatch(receiveCommentSuggestions(suggestions));
          return suggestions;
        } catch (error) {
          notifyError(error);
          return [];
        } finally {
          dispatch(stopLoadingCommentSuggestions());
        }
      };
    },

    getCommentVisibilityOptions: function getCommentVisibilityOptions(): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<Array<User | UserGroup>>) {
      return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<Array<User | UserGroup>> => {
        const api: Api = getApi();
        const issueId: string = getState()[stateFieldName].issue.id;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Open comment visibility select');
        return api.issue.getVisibilityOptions(issueId);
      };
    },

    onReactionSelect: function onReactionSelect(
      issueId: string,
      comment: IssueComment,
      reaction: Reaction,
      activities: Array<ActivityItem>,
      onReactionUpdate: (activities: Array<ActivityItem>, error?: CustomError) => void,
    ): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueApi: IssueAPI = getApi().issue;
        //$FlowFixMe
        const currentUser: User = getState().app.user;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Reaction select');

        const reactionName: string = reaction.reaction;
        const existReaction: Reaction = (comment.reactions || []).filter(
          it => it.reaction === reactionName && it.author.id === currentUser.id)[0];

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
            if (!(targetComment.reactionOrder).split(COMMENT_REACTIONS_SEPARATOR).some(
              (it: string) => it === reactionName)) {
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
    },

    onCheckboxUpdate: function onCheckboxUpdate(checked: boolean, position: number, comment: IssueComment): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        const [error, response] = await until(api.issue.updateCommentCheckbox(issue.id, checked, position, comment));
        if (!error && response) {
          dispatch(updateComment({
            ...comment,
            text: response.text,
          }));
        }
      };
    },

  };
  return actions;
};
