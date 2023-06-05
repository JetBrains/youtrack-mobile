import {Clipboard} from 'react-native';
import * as activityHelper from './issue-activity__helper';
import * as types from '../issue-action-types';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUE_PAGE} from 'components/analytics/analytics-ids';
import {confirmation} from 'components/confirmation/confirmation';
import {
  convertCommentsToActivityPage,
  findActivityInGroupedActivities,
} from 'components/activity/activity-helper';
import {
  createIssueActivityActions,
  receiveActivityAPIAvailability,
  receiveActivityPage,
} from './issue-activity__actions';
import {DEFAULT_ISSUE_STATE_FIELD_NAME} from '../issue-base-actions-creater';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from 'components/notification/notification';
import {showActions} from 'components/action-sheet/action-sheet';
import {until} from 'util/util';
import {updateActivityCommentReactions} from 'components/activity-stream/activity__stream-helper';
import type Api from 'components/api/api';
import type IssueAPI from 'components/api/api__issue';
import type {Activity, ActivityPositionData} from 'types/Activity';
import type {CustomError} from 'types/Error';
import type {IssueComment} from 'types/CustomFields';
import type {IssueFull} from 'types/Issue';
import type {Reaction} from 'types/Reaction';
import type {State as IssueActivityState} from './issue-activity__reducers';
import type {State as IssueCommentActivityState} from './issue-activity__comment-reducers';
import type {State as SingleIssueState} from '../issue-reducers';
import type {UserGroup} from 'types/UserGroup';
import type {User} from 'types/User';
type ApiGetter = () => Api;
type StateGetter = () => {
  issueActivity: IssueActivityState;
  issueCommentActivity: IssueCommentActivityState;
  issueState: SingleIssueState;
};
export function updateComment(
  comment: IssueComment,
): {
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
  activityId?: string,
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
export function receiveCommentSuggestions(
  suggestions: Record<string, any>,
): {
  suggestions: any;
  type: any;
} {
  return {
    type: types.RECEIVE_COMMENT_SUGGESTIONS,
    suggestions,
  };
}
export const createActivityCommentActions = (
  stateFieldName: string = DEFAULT_ISSUE_STATE_FIELD_NAME,
): any => {
  const actions = {
    loadIssueCommentsAsActivityPage: function loadIssueCommentsAsActivityPage(): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issueId = getState()[stateFieldName].issueId;
        const api: Api = getApi();

        try {
          const comments = await api.issue.getIssueComments(issueId);
          log.info(`Loaded ${comments.length} comments for ${issueId} issue`);
          dispatch(receiveActivityAPIAvailability(false));
          const activityPage = convertCommentsToActivityPage(comments);
          dispatch(
            createIssueActivityActions(
              stateFieldName,
            ).receiveActivityEnabledTypes(),
          );
          dispatch(receiveActivityPage(activityPage));
        } catch (error) {
          dispatch({
            type: types.RECEIVE_COMMENTS_ERROR,
            error: error,
          });
          notifyError(error);
        }
      };
    },
    loadActivity: function loadActivity(
      doNotReset: boolean = false,
    ): (dispatch: (arg0: any) => any) => Promise<void> {
      return async (dispatch: (arg0: any) => any) => {
        if (activityHelper.isIssueActivitiesAPIEnabled()) {
          dispatch(
            createIssueActivityActions(stateFieldName).loadActivitiesPage(
              doNotReset,
            ),
          );
        } else {
          dispatch(actions.loadIssueCommentsAsActivityPage());
        }
      };
    },
    getDraftComment: (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<IssueComment | null> => async (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => {
      const issueState: SingleIssueState = getState()[stateFieldName];
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
    updateDraftComment: (draftComment: IssueComment, doNotFlush: boolean = false): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<null | IssueComment> => async (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ): Promise<null | IssueComment> => {
      const issueState: SingleIssueState = getState()[stateFieldName];
      const issueId: string | undefined = draftComment?.issue?.id || issueState?.issueId || issueState?.issue?.id;
      if (draftComment && issueId) {
        const [error, draft] = await until(
          getApi().issue.updateDraftComment(issueId, draftComment),
        );

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
    submitDraftComment: function submitDraftComment(
      draftComment: IssueComment,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issueId: string | undefined = draftComment?.issue?.id || getState()[stateFieldName]?.issue?.id;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Add comment', 'Success');

        if (draftComment && issueId) {
          const [error] = await until(
            getApi().issue.submitDraftComment(issueId, draftComment),
          );

          if (error) {
            notifyError(error);
          } else {
            dispatch(actions.setEditingComment(null));
            dispatch(actions.loadActivity(true));
          }
        }
      };
    },
    setEditingComment: function setEditingComment(comment: (IssueComment | {text: string, reply: boolean }) | null): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        dispatch({
          type: types.SET_EDITING_COMMENT,
          comment,
        });
      };
    },
    submitEditedComment: function submitEditedComment(
      comment: IssueComment,
      isAttachmentChange: boolean = false,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issue: IssueFull = getState()[stateFieldName].issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update comment');

        try {
          const updatedComment = await getApi().issue.submitComment(
            issue.id,
            comment,
          );
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
    toggleCommentDeleted: function toggleCommentDeleted(
      comment: IssueComment,
      deleted: boolean,
    ) {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issueId = getState()[stateFieldName].issueId;

        try {
          const _comment: IssueComment = await getApi().issue.updateCommentDeleted(
            issueId,
            comment.id,
            deleted,
          );
          dispatch(updateComment({...comment, ..._comment}));
          log.info(
            `Comment ${
              comment.id
            } deleted state updated: ${deleted.toString()}`,
          );
        } catch (error) {
          dispatch(updateComment({...comment}));
          notifyError(error);
        }
      };
    },
    deleteComment: function deleteComment(
      comment: IssueComment,
    ): (dispatch: (arg0: any) => any) => Promise<unknown> {
      return async (dispatch: (arg0: any) => any) => {
        return dispatch(actions.toggleCommentDeleted(comment, true));
      };
    },
    restoreComment: function restoreComment(
      comment: IssueComment,
    ): (dispatch: (arg0: any) => any) => Promise<any> {
      return async (dispatch: (arg0: any) => any) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Restore comment');
        return dispatch(actions.toggleCommentDeleted(comment, false));
      };
    },
    deleteCommentPermanently: function deleteCommentPermanently(
      comment: IssueComment,
      activityId?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issueId = getState()[stateFieldName].issueId;
        confirmation(i18n('Delete comment permanently?'), i18n('Delete'))
          .then(async () => {
            try {
              await getApi().issue.deleteCommentPermanently(
                issueId,
                comment.id,
              );
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
    copyCommentUrl: function copyCommentUrl(id: string): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => void {
      return (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        Clipboard.setString(activityHelper.makeIssueWebUrl(api, issue, id));
        notify(i18n('Link to comment copied'));
      };

    },
    showIssueCommentActions: function showIssueCommentActions(
      actionSheet: Record<string, any>,
      comment: IssueComment,
      updateComment: ((comment: IssueComment) => void) | null | undefined,
      canDeleteComment: boolean,
    ): (dispatch: (arg0: any) => any) => Promise<void> {
      return async (dispatch: (arg0: any) => any) => {
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

        contextActions.push({
          title: i18n('Cancel'),
        });
        const selectedAction = await showActions(
          contextActions,
          actionSheet,
          comment?.author ? getEntityPresentation(comment.author) : null,
          comment.text.length > 155
            ? `${comment.text.substr(0, 153)}…`
            : comment.text,
        );

        if (selectedAction && selectedAction.execute) {
          selectedAction.execute();
        }
      };
    },
    loadCommentSuggestions: function loadCommentSuggestions(
      query: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ): Promise<Array<User>> => {
        const api: Api = getApi();
        const issue: IssueFull = getState()[stateFieldName].issue;
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
          notifyError(error);
          return [];
        } finally {
          dispatch(stopLoadingCommentSuggestions());
        }
      };
    },
    getCommentVisibilityOptions: function getCommentVisibilityOptions(): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<Array<User | UserGroup>> {
      return (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ): Promise<Array<User | UserGroup>> => {
        const api: Api = getApi();
        const issueId: string = getState()[stateFieldName].issue.id;
        usage.trackEvent(
          ANALYTICS_ISSUE_PAGE,
          'Open comment visibility select',
        );
        return api.issue.getVisibilityOptions(issueId);
      };
    },
    onReactionSelect: function onReactionSelect(
      issueId: string,
      comment: IssueComment,
      reaction: Reaction,
      activities: Activity[],
      onReactionUpdate: (
        activities: Activity[],
        error?: CustomError,
      ) => void,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issueApi: IssueAPI = getApi().issue;
          const currentUser: User = getState().app.user;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Reaction select');
        const reactionName: string = reaction.reaction;
        const existReaction: Reaction = (comment.reactions || []).filter(
          it => it.reaction === reactionName && it.author.id === currentUser.id,
        )[0];
        const [error, commentReaction] = await until(
          existReaction
            ? issueApi.removeCommentReaction(
                issueId,
                comment.id,
                existReaction.id,
              )
            : issueApi.addCommentReaction(issueId, comment.id, reactionName),
        );

        if (error) {
          onReactionUpdate(activities, error);
          notifyError(error);
          return;
        }

        const targetActivityData:
          | ActivityPositionData
          | null
          | undefined = findActivityInGroupedActivities(activities, comment.id);

        if (targetActivityData) {
          const _comment = updateActivityCommentReactions({
            comment,
            currentUser,
            reaction: existReaction ? reaction : commentReaction,
          });

          const newActivities: Activity[] = activities.slice(0);
          const targetActivity: Activity | null | undefined =
            newActivities[targetActivityData.index];

          if (targetActivity && Array.isArray(targetActivity?.comment?.added)) {
            targetActivity.comment.added = [_comment];
            onReactionUpdate(newActivities);
          }
        }
      };
    },
    onCheckboxUpdate: function onCheckboxUpdate(
      checked: boolean,
      position: number,
      comment: IssueComment,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        const [error, response] = await until(
          api.issue.updateCommentCheckbox(issue.id, checked, position, comment),
        );

        if (!error && response) {
          dispatch(updateComment({...comment, text: response.text}));
        }
      };
    },
  };
  return actions;
};
