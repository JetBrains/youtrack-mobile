/* @flow */

import {Clipboard, Share} from 'react-native';
import * as types from './single-issue-action-types';
import {attachmentTypes, attachmentActions} from './single-issue__attachment-actions-and-types';
import ApiHelper from '../../components/api/api__helper';
import {notify, notifyError} from '../../components/notification/notification';
import {resolveError} from '../../components/error/error-resolver';
import log from '../../components/log/log';
import Router from '../../components/router/router';
import {showActions} from '../../components/action-sheet/action-sheet';
import usage from '../../components/usage/usage';
import {initialState} from './single-issue-reducers';
import {isIOSPlatform} from '../../util/util';
import {receiveUserAppearanceProfile} from '../../actions/app-actions';

import type {IssueFull, CommandSuggestionResponse, OpenNestedViewParams} from '../../flow/Issue';
import type {CustomField, IssueProject, FieldValue, Attachment} from '../../flow/CustomFields';
import type Api from '../../components/api/api';
import type {State as SingleIssueState} from './single-issue-reducers';
import type {UserAppearanceProfile} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';

const CATEGORY_NAME = 'Issue';

type ApiGetter = () => Api;
type StateGetter = () => { singleIssue: SingleIssueState };

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

export function receiveIssueVisibility(visibility: Visibility) {
  return {type: types.RECEIVE_ISSUE_VISIBILITY, visibility};
}

export function loadIssueAttachments() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    if (!issueId) {
      return;
    }

    try {
      const attachments = await getApi().issue.getIssueAttachments(issueId);
      dispatch({
        type: attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS,
        attachments
      });
    } catch (error) {
      log.warn('Failed to load issue attachments', error);
    }
  };
}

export function loadIssue() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      if (!issueId) {
        throw new Error('Attempt to load issue with no ID');
      }
      log.debug(`Loading issue "${issueId}"`);
      const issue = await api.issue.getIssue(issueId);
      log.info(`Issue "${issueId}" loaded`, {...issue, fields: 'CENSORED'});
      issue.fieldHash = ApiHelper.makeFieldHash(issue);

      dispatch(setIssueId(issue.id)); //Set issue ID again because first one could be readable like YTM-111
      dispatch(receiveIssue(issue));
      return issue;
    } catch (rawError) {
      const error = await resolveError(rawError);
      dispatch({type: types.RECEIVE_ISSUE_ERROR, error});
      log.warn('Failed to load issue', error);
    }
  };
}

export function refreshIssue() {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    dispatch(startIssueRefreshing());
    try {
      const successMessage = 'Issue updated';
      await dispatch(loadIssue());
      notify(successMessage);
      log.debug(`${successMessage} "${getState().singleIssue.issueId}" loaded`);
    } catch (error) {
      const errorMessage = 'Cannot update issue';
      notify(errorMessage, error);
    } finally {
      dispatch(stopIssueRefreshing());
    }
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
      await api.issue.updateIssueSummaryDescription(issue);
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
    const updateMethod = (...args) => {
      if (field.hasStateMachine) {
        return api.issue.updateIssueFieldEvent(...args);
      }
      return api.issue.updateIssueFieldValue(...args);
    };

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
      await api.issue.updateProject(issue, project);
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
      await api.issue.updateIssueVoted(issue.id, voted);
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
      await api.issue.updateIssueStarred(issue.id, starred);
    } catch (err) {
      notifyError('Cannot update "Starred"', err);
      dispatch(setStarred(!starred));
    }
  };
}

function makeIssueWebUrl(api: Api, issue: IssueFull, commentId: ?string) {
  const commentHash = commentId ? `#comment=${commentId}` : '';
  return `${api.config.backendUrl}/issue/${issue.idReadable}${commentHash}`;
}

export function showIssueActions(actionSheet: Object, switchToDetailsTab: () => any) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    const actions = [
      {
        title: 'Copy issue URL',
        execute: () => {
          usage.trackEvent(CATEGORY_NAME, 'Open in browser');
          Clipboard.setString(makeIssueWebUrl(api, issue));
          notify('Issue URL copied');
        }
      },
      {
        title: 'Edit',
        execute: () => {
          dispatch(startEditingIssue());
          usage.trackEvent(CATEGORY_NAME, 'Edit issue');
        }
      },
      {
        title: 'Attach file',
        execute: () => {
          switchToDetailsTab();
          dispatch(attachmentActions.toggleAttachFileDialog(true));
        }
      }
    ]
      .concat([
        {
          title: 'Share…',
          execute: () => {
            const url = makeIssueWebUrl(api, issue);
            if (isIOSPlatform()) {
              Share.share({url});
            } else {
              Share.share({title: issue.summary, message: url}, {dialogTitle: 'Share issue URL'});
            }
            usage.trackEvent(CATEGORY_NAME, 'Copy issue URL');
          }
        },
        {
          title: 'Apply command…',
          execute: () => dispatch(openCommandDialog())
        }
      ])
      .concat({title: 'Cancel'});

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function openNestedIssueView(params: OpenNestedViewParams) {
  return () => {
    if (!params.issue) {
      return Router.SingleIssue({issueId: params.issueId});
    }

    Router.SingleIssue({
      issuePlaceholder: {...params.issue, ...{fieldHash: ApiHelper.makeFieldHash(params.issue)}},
      issueId: params.issue?.id
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

      dispatch(closeCommandDialog());

      if (command.trim() === 'delete') {
        notify('Issue deleted');
        return Router.IssueList();
      }

      notify('Command successfully applied');
      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      notifyError('Failed to apply command', err);
    } finally {
      dispatch(stopApplyingCommand());
    }
  };
}

export function updateUserAppearanceProfile(userAppearanceProfile: UserAppearanceProfile) {
  return async (dispatch: (any) => any) => {
    dispatch(receiveUserAppearanceProfile(userAppearanceProfile));
  };
}

export function uploadAttach(attach: Attachment) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    await dispatch(attachmentActions.uploadFile(attach, getState().singleIssue.issueId));
  };
}

export function cancelAddAttach(attach: Attachment) {
  return async (dispatch: (any) => any) => {
    await dispatch(attachmentActions.cancelImageAttaching(attach));
  };
}

export function loadAttachments() {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    dispatch(attachmentActions.loadIssueAttachments(getState().singleIssue.issueId));
  };
}

export function hideAddAttachDialog() {
  return async (dispatch: (any) => any) => {
    dispatch(attachmentActions.toggleAttachFileDialog(false));
  };
}

export function removeAttachment(attach: Attachment) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    dispatch(attachmentActions.removeAttachment(attach, getState().singleIssue.issueId));
  };
}

export function updateIssueVisibility(visibility: Visibility) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const singleIssue: IssueFull = getState().singleIssue;
    const prevVisibility: Visibility = singleIssue.issue.visibility;

    try {
      const issueWithUpdatedVisibility: Visibility = await getApi().issue.updateVisibility(singleIssue.issueId, visibility);
      dispatch(receiveIssueVisibility(issueWithUpdatedVisibility.visibility));

    } catch (err) {
      dispatch(receiveIssueVisibility(Object.assign({timestamp: Date.now()}, prevVisibility)));
      const message: string = 'Cannot update issue visibility';
      notify(message, err);
      log.warn(message, err);
    }
  };
}
