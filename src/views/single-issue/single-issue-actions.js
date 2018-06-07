/* @flow */
import {Clipboard, Linking, Alert} from 'react-native';
import * as types from './single-issue-action-types';
import ApiHelper from '../../components/api/api__helper';
import {notify, notifyError, resolveError} from '../../components/notification/notification';
import attachFile from '../../components/attach-file/attach-file';
import log from '../../components/log/log';
import Router from '../../components/router/router';
import {showActions} from '../../components/action-sheet/action-sheet';
import usage from '../../components/usage/usage';
import {initialState}  from './single-issue-reducers';
import type {IssueFull, CommandSuggestionResponse} from '../../flow/Issue';
import type {CustomField, IssueProject, FieldValue, IssueComment} from '../../flow/CustomFields';
import type Api from '../../components/api/api';
import type {State as SingleIssueState} from './single-issue-reducers';

const CATEGORY_NAME = 'Issue';

type ApiGetter = () => Api;
type StateGetter = () => {singleIssue: SingleIssueState};

export function setIssueId(issueId: string) {
  return {type: types.SET_ISSUE_ID, issueId};
}

export function startIssueRefreshing() {
  return {type: types.START_ISSUE_REFRESHING};
}

export function stopIssueRefreshing() {
  return {type: types.STOP_ISSUE_REFRESHING};
}

export function receiveIssue(issue: IssueFull) {
  return {type: types.RECEIVE_ISSUE, issue};
}

export function receiveComments(comments: Array<IssueComment>) {
  return {type: types.RECEIVE_COMMENTS, comments};
}

export function showCommentInput() {
  return {type: types.SHOW_COMMENT_INPUT};
}

export function hideCommentInput() {
  return {type: types.HIDE_COMMENT_INPUT};
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

export function receiveComment(comment: Object) {
  return {type: types.RECEIVE_COMMENT, comment};
}

function updateComment(comment: IssueComment) {
  return {type: types.RECEIVE_UPDATED_COMMENT, comment};
}

function deleteCommentFromList(comment: IssueComment) {
  return {type: types.DELETE_COMMENT, comment};
}

export function startImageAttaching(attachingImage: Object) {
  return {type: types.START_IMAGE_ATTACHING, attachingImage};
}

export function removeAttachingImage() {
  return {type: types.REMOVE_ATTACHING_IMAGE};
}

export function stopImageAttaching() {
  return {type: types.STOP_IMAGE_ATTACHING};
}

export function setIssueFieldValue(field: CustomField, value: FieldValue) {
  return {type: types.SET_ISSUE_FIELD_VALUE, field, value};
}

export function setProject(project: IssueProject) {
  return {type: types.SET_PROJECT, project};
}

export function startEditingIssue() {
  return {type: types.START_EDITING_ISSUE};
}

export function stopEditingIssue() {
  return {type: types.STOP_EDITING_ISSUE};
}

export function setIssueSummaryAndDescription(summary: string, description: string) {
  return {type: types.SET_ISSUE_SUMMARY_AND_DESCRIPTION, summary, description};
}

export function setIssueSummaryCopy(summary: string) {
  return {type: types.SET_ISSUE_SUMMARY_COPY, summary};
}

export function setIssueDescriptionCopy(description: string) {
  return {type: types.SET_ISSUE_DESCRIPTION_COPY, description};
}

export function startSavingEditedIssue() {
  return {type: types.START_SAVING_EDITED_ISSUE};
}

export function stopSavingEditedIssue() {
  return {type: types.STOP_SAVING_EDITED_ISSUE};
}

export function setVoted(voted: boolean) {
  return {type: types.SET_VOTED, voted};
}

export function setStarred(starred: boolean) {
  return {type: types.SET_STARRED, starred};
}

export function issueUpdated(issue: IssueFull) {
  return {type: types.ISSUE_UPDATED, issue};
}

export function resetIssueView() {
  return {type: types.RESET_SINGLE_ISSUE};
}

export function unloadActiveIssueView() {
  return {type: types.UNLOAD_ACTIVE_ISSUE_VIEW};
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

export function openCommandDialog(initialCommand: string = '') {
  return {type: types.OPEN_COMMAND_DIALOG, initialCommand};
}

export function closeCommandDialog() {
  return {type: types.CLOSE_COMMAND_DIALOG};
}

export function receiveCommandSuggestions(suggestions: CommandSuggestionResponse) {
  return {type: types.RECEIVE_COMMAND_SUGGESTIONS, suggestions};
}

export function startApplyingCommand() {
  return {type: types.START_APPLYING_COMMAND};
}

export function stopApplyingCommand() {
  return {type: types.STOP_APPLYING_COMMAND};
}

const getIssue = async (api, issueId) => {
  if (/[A-Z]/.test(issueId)) {
    return api.hackishGetIssueByIssueReadableId(issueId);
  }
  return api.getIssue(issueId);
};

export function loadIssueComments() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      const comments = await api.getIssueComments(issueId);
      log.info(`Loaded ${comments.length} comments for "${issueId}" issue`);
      dispatch(receiveComments(comments));
    } catch (err) {
      dispatch({type: types.RECEIVE_COMMENTS_ERROR, error: err});
      notifyError('Failed to load comments', err);
    }
  };
}

export function loadIssue() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      const issue = await getIssue(api, issueId);
      log.info(`Issue "${issueId}" loaded`);
      issue.fieldHash = ApiHelper.makeFieldHash(issue);

      dispatch(setIssueId(issue.id)); //Set issue ID again because first one could be readable like YTM-111
      dispatch(receiveIssue(issue));
      return issue;
    } catch (err) {
      notifyError('Failed to load issue', err);
    }
  };
}

export function refreshIssue() {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    dispatch(startIssueRefreshing());
    log.info('About to refresh issue');
    await Promise.all([
      await dispatch(loadIssue()),
      await dispatch(loadIssueComments())
    ]);
    dispatch(stopIssueRefreshing());
  };
}

export function saveIssueSummaryAndDescriptionChange() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {summaryCopy, descriptionCopy} = getState().singleIssue;

    dispatch(setIssueSummaryAndDescription(summaryCopy, descriptionCopy));
    dispatch(startSavingEditedIssue());

    try {
      const {issue} = getState().singleIssue;
      await api.updateIssueSummaryDescription(issue);
      log.info(`Issue (${issue.id}) summary/description has been updated`);
      usage.trackEvent(CATEGORY_NAME, 'Update issue', 'Success');

      await dispatch(loadIssue());
      dispatch(stopEditingIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      await dispatch(loadIssue());
      notifyError('Failed to update issue', err);
    } finally {
      dispatch(stopSavingEditedIssue());
    }
  };
}

export function addComment(commentText: string) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    dispatch(startSubmittingComment());
    try {
      const createdComment = await api.submitComment(issue.id, commentText);
      log.info(`Comment added to issue ${issue.id}`);
      usage.trackEvent(CATEGORY_NAME, 'Add comment', 'Success');

      dispatch(receiveComment(createdComment));
      dispatch(hideCommentInput());
      dispatch(loadIssueComments());
    } catch (err) {
      dispatch(showCommentInput());
      dispatch(setCommentText(commentText));
      notifyError('Cannot post comment', err);
    } finally {
      dispatch(stopSubmittingComment());
    }
  };
}


export function startEditingComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch(setCommentText(comment.text));
    dispatch(showCommentInput());
    dispatch({type: types.SET_EDITING_COMMENT, comment});
  };
}

export function stopEditingComment() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch(hideCommentInput());
    dispatch(setCommentText(''));
    dispatch({type: types.CLEAR_EDITING_COMMENT});
  };
}

export function submitEditedComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    dispatch(startSubmittingComment());

    try {
      const updatedComment = await getApi().submitComment(issueId,  comment.text, comment.id);

      dispatch(updateComment(updatedComment));
      log.info(`Comment ${updatedComment.id} edited`);
      notify('Comment successfully edited');
      dispatch(stopEditingComment());
      await dispatch(loadIssue());
    } catch (err) {
      notifyError('Failed to edit comment', err);
    } finally {
      dispatch(stopSubmittingComment());
    }
  };
}

export function addOrEditComment(text: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const editingComment = getState().singleIssue.editingComment;
    if (editingComment) {
      dispatch(submitEditedComment({...editingComment, text}));
    } else {
      dispatch(addComment(text));
    }
  };
}

function toggleCommentDeleted(comment: IssueComment, deleted: boolean) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    try {
      dispatch(updateComment({...comment, deleted}));
      await getApi().updateCommentDeleted(issueId, comment.id, deleted);
      log.info(`Comment ${comment.id} deleted state updated: ${deleted.toString()}`);
    } catch (err) {
      dispatch(updateComment({...comment}));
      notifyError(`Failed to ${deleted ? 'delete' : 'restore'} comment`, err);
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

export function deleteCommentPermanently(comment: IssueComment) {
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
    } catch (err) {
      log.log('Deletion confirmation declined');
    }

    try {
      dispatch(deleteCommentFromList(comment));
      log.info(`Comment ${comment.id} deleted forever`);
      await getApi().deleteCommentPermanently(issueId, comment.id);
    } catch (err) {
      dispatch(loadIssue());
      notifyError(`Failed to delete comment`, err);
    }
  };
}

export function attachImage() {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    try {
      const attachingImage = await attachFile();
      dispatch(startImageAttaching(attachingImage));

      try {
        await api.attachFile(issue.id, attachingImage.url, attachingImage.name);
        log.info(`Image attached to issue ${issue.id}`);
        usage.trackEvent(CATEGORY_NAME, 'Attach image', 'Success');
      } catch (err) {
        notifyError('Cannot attach file', err);
        dispatch(removeAttachingImage());
      }
      dispatch(stopImageAttaching());
    } catch (err) {
      notifyError('ImagePicker error', err);
    }
  };
}

export function updateIssueFieldValue(field: CustomField, value: FieldValue) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    usage.trackEvent(CATEGORY_NAME, 'Update field value');

    dispatch(setIssueFieldValue(field, value));
    const updateMethod = field.hasStateMachine
      ? api.updateIssueFieldEvent.bind(api)
      : api.updateIssueFieldValue.bind(api);

    try {
      await updateMethod(issue.id, field.id, value);
      log.info('Field value updated', field, value);
      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      const error = await resolveError(err);

      if (error.error_type === 'workflow' && error.error_workflow_type === 'require') {
        log.info('Workflow require received', error);
        dispatch(openCommandDialog(`${error.error_field} `));
      }

      notifyError('Failed to update issue field', error);
      dispatch(loadIssue());
    }
  };
}

export function updateProject(project: IssueProject) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    usage.trackEvent(CATEGORY_NAME, 'Update project');

    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    dispatch(setProject(project));

    try {
      await api.updateProject(issue, project);
      log.info('Project updated');
      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      notifyError('Failed to update issue project', err);
      dispatch(loadIssue());
    }
  };
}

export function toggleVote(voted: boolean) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    dispatch(setVoted(voted));
    try {
      await api.updateIssueVoted(issue.id, voted);
    } catch (err) {
      notifyError('Cannot update "Voted"', err);
      dispatch(setVoted(!voted));
    }
  };
}

export function toggleStar(starred: boolean) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    dispatch(setStarred(starred));
    try {
      await api.updateIssueStarred(issue.id, starred);
    } catch (err) {
      notifyError('Cannot update "Starred"', err);
      dispatch(setStarred(!starred));
    }
  };
}

function makeIssueWebUrl(api: Api, issue: IssueFull, commentId: ?string) {
  const {numberInProject, project} = issue;
  const commentHash = commentId ? `#comment=${commentId}` : '';
  return `${api.config.backendUrl}/issue/${project.shortName}-${numberInProject}${commentHash}`;
}

export function copyCommentUrl(comment: IssueComment) {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    Clipboard.setString(makeIssueWebUrl(api, issue, comment.id));
    notify('Comment URL has been copied');
  };
}

export function showIssueActions(actionSheet: Object) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    const actions = [
      {
        title: 'Copy issue URL',
        execute: () => {
          usage.trackEvent(CATEGORY_NAME, 'Copy issue URL');
          Clipboard.setString(makeIssueWebUrl(api, issue));
          notify('Issue URL has been copied');
        }
      },
      {
        title: 'Open issue in browser',
        execute: () => {
          usage.trackEvent(CATEGORY_NAME, 'Open in browser');
          Linking.openURL(makeIssueWebUrl(api, issue));
        }
      },
      {
        title: 'Apply command…',
        execute: () => dispatch(openCommandDialog())
      },
      {title: 'Cancel'}
    ];

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function openNestedIssueView(issue: ?IssueFull, issueId: ?string) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    if (!issue) {
      return Router.SingleIssue({issueId});
    }

    issue.fieldHash = ApiHelper.makeFieldHash(issue);
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id
    });
  };
}

export function unloadIssueIfExist() {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    const state = getState().singleIssue;
    if (state !== initialState) {
      dispatch(unloadActiveIssueView());
    }
  };
}

export function openIssueListWithSearch(query: string) {
  return () => {
    Router.IssueList({query});
  };
}

export function loadCommentSuggestions(query: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issue: IssueFull = getState().singleIssue.issue;
    dispatch(startLoadingCommentSuggestions());

    try {
      const suggestions = await api.getMentionSuggests([issue.id], query);
      dispatch(receiveCommentSuggestions(suggestions));
    } catch (err) {
      notifyError('Failed to load comment suggestions', err);
    } finally {
      dispatch(stopLoadingCommentSuggestions());
    }
  };
}

export function loadCommandSuggestions(command: string, caret: number) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      const suggestionsRes = await api.getCommandSuggestions([issueId], command, caret);

      dispatch(receiveCommandSuggestions(suggestionsRes));
    } catch (err) {
      notifyError('Failed to load command suggestions', err);
    }
  };
}

export function applyCommand(command: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;

    try {
      dispatch(startApplyingCommand());

      await getApi().applyCommand({issueIds: [issueId], command});

      notify('Comand successfully applied');
      dispatch(closeCommandDialog());
      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      notifyError('Failed to apply command', err);
    } finally {
      dispatch(stopApplyingCommand());
    }
  };
}
