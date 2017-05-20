/* @flow */
import {Clipboard, Linking} from 'react-native';
import * as types from './single-issue-action-types';
import ApiHelper from '../../components/api/api__helper';
import {notify, notifyError} from '../../components/notification/notification';
import attachFile from '../../components/attach-file/attach-file';
import Router from '../../components/router/router';
import {showActions} from '../../components/action-sheet/action-sheet';
import usage from '../../components/usage/usage';
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

export function showCommentInput() {
  return {type: types.SHOW_COMMENT_INPUT};
}

export function hideCommentInput() {
  return {type: types.HIDE_COMMENT_INPUT};
}

export function startAddingComment() {
  return {type: types.START_ADDING_COMMENT, comment: ''};
}

export function startReply(targetLogin: string) {
  return {type: types.START_ADDING_COMMENT, comment: `@${targetLogin} `};
}

export function setCommentText(comment: string) {
  return {type: types.SET_COMMENT_TEXT, comment};
}

export function stopAddingComment() {
  return {type: types.STOP_ADDING_COMMENT};
}

export function receiveComment(comment: Object) {
  return {type: types.RECEIVE_COMMENT, comment};
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

export function restorePreviousActiveIssueView() {
  return {type: types.RESTORE_PREVIOUS_ISSUE_VIEW};
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

export function openCommandDialog() {
  return {type: types.OPEN_COMMAND_DIALOG};
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

export function loadIssue() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      const issue = await getIssue(api, issueId);
      issue.fieldHash = ApiHelper.makeFieldHash(issue);

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
    await dispatch(loadIssue());
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
      dispatch(stopEditingIssue());
      usage.trackEvent(CATEGORY_NAME, 'Update issue', 'Success');

      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      await dispatch(loadIssue());
      notifyError('Failed to update issue', err);
    } finally {
      dispatch(stopSavingEditedIssue());
    }
  };
}

export function addComment(comment: string) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    dispatch(startAddingComment());
    try {
      const createdComment = await api.addComment(issue.id, comment);
      usage.trackEvent(CATEGORY_NAME, 'Add comment', 'Success');

      dispatch(receiveComment(createdComment));
      dispatch(hideCommentInput());
      dispatch(loadIssue());
    } catch (err) {
      notifyError('Cannot post comment', err);
    } finally {
      dispatch(stopAddingComment());
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
      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      notifyError('Failed to update issue field', err);
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

    if (selectedAction) {
      selectedAction.execute();
    }
  };
}

export function closeSingleIssue() {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    const {unloadedIssueState} = getState().singleIssue;
    Router.pop();

    if (unloadedIssueState) {
      dispatch(restorePreviousActiveIssueView());
    } else {
      dispatch(resetIssueView());
    }
  };
}

export function openNestedIssueView(issue: ?IssueFull, issueId: ?string) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    dispatch(unloadActiveIssueView());
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

export function openIssueListWithSearch(query: string) {
  Router.IssueList({query});
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
