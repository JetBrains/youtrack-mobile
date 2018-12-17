/* @flow */
import type Api from '../../components/api/api';
import ApiHelper from '../../components/api/api__helper';
import type {IssueFull} from '../../flow/Issue';
import type {CustomField, FieldValue, Attachment} from '../../flow/CustomFields';
import usage from '../../components/usage/usage';
import * as types from './create-issue-action-types';
import Router from '../../components/router/router';
import log from '../../components/log/log';
import attachFile from '../../components/attach-file/attach-file';
import {getStorageState, flushStoragePart} from '../../components/storage/storage';
import {notify, notifyError, resolveError} from '../../components/notification/notification';

export const CATEGORY_NAME = 'Create issue view';

type ApiGetter = () => Api;

export function setIssueDraft(issue: IssueFull) {
  return {type: types.SET_ISSUE_DRAFT, issue};
}

export function resetIssueDraftId() {
  return {type: types.RESET_ISSUE_DRAFT};
}

export function setPredefinedDraftId(draftId: string) {
  return {type: types.SET_ISSUE_PREDEFINED_DRAFT_ID, draftId};
}

export function setDraftProjectId(projectId: string) {
  return {type: types.SET_DRAFT_PROJECT_ID, projectId};
}

export function setIssueProject(project: Object) {
  return {type: types.SET_ISSUE_PROJECT, project};
}

export function resetIssueCreation() {
  return {type: types.RESET_CREATION};
}

export function clearDraftProject() {
  return {type: types.CLEAR_DRAFT_PROJECT};
}

export function setIssueSummary(summary: string) {
  return {type: types.SET_ISSUE_SUMMARY, summary};
}

export function setIssueDescription(description: string) {
  return {type: types.SET_ISSUE_DESCRIPTION, description};
}

export function startIssueCreation() {
  return {type: types.START_ISSUE_CREATION};
}

export function stopIssueCreation() {
  return {type: types.STOP_ISSUE_CREATION};
}

export function issueCreated(issue: IssueFull, preDefinedDraftId: ?string) {
  return {type: types.ISSUE_CREATED, issue, preDefinedDraftId};
}

export function setIssueFieldValue(field: CustomField, value: FieldValue) {
  return {type: types.SET_ISSUE_FIELD_VALUE, field, value};
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

async function clearIssueDraftStorage() {
  return await flushStoragePart({draftId: null});
}

export async function storeProjectId(projectId: string) {
  return await flushStoragePart({projectId});
}

async function storeIssueDraftId(draftId: string) {
  return await flushStoragePart({draftId});
}

export function storeDraftAndGoBack() {
  return async (dispatch: (any) => any) => {
    await dispatch(updateIssueDraft());
    Router.pop();
    //Hack: reset state after timeout to let router close the view without freezes
    setTimeout(() => dispatch(resetIssueCreation()), 500);
  };
}

export function loadStoredProject() {
  return async (dispatch: (any) => any) => {
    const projectId = getStorageState().projectId;
    if (projectId) {
      log.info(`Stored project loaded, id=${projectId}`);
      dispatch(setDraftProjectId(projectId));
      return await dispatch(updateIssueDraft());
    }
  };
}

export function loadIssueFromDraft(draftId: string) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    try {
      const issue = await api.issue.loadIssueDraft(draftId);
      log.info(`Issue draft loaded, "${issue.summary}"`);
      dispatch(setIssueDraft(issue));
    } catch (err) {
      log.info('Cannot load issue draft, cleaning up');
      clearIssueDraftStorage();
      dispatch(resetIssueDraftId());
      dispatch(loadStoredProject());
    }
  };
}

export function applyCommandForDraft(command: string) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const draftId = getState().creation.issue.id;

    try {
      await getApi().applyCommand({issueIds: [draftId], command});

      notify('Command successfully applied');
      await dispatch(loadIssueFromDraft(draftId));
    } catch (err) {
      notifyError('Failed to apply command', err);
    }
  };
}

export function updateIssueDraft(ignoreFields: boolean = false) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().creation;

    if (!issue.project || !issue.project.id) {
      return;
    }

    const issueToSend = {
      id: issue.id,
      summary: issue.summary,
      description: issue.description,
      project: issue.project
    };

    try {
      const issue = await api.issue.updateIssueDraft(issueToSend);

      if (ignoreFields) {
        delete issue.fields;
      }

      log.info('Issue draft updated', issueToSend);
      dispatch(setIssueDraft(issue));
      if (!getState().creation.predefinedDraftId) {
        return await storeIssueDraftId(issue.id);
      }
    } catch (err) {
      const error = await resolveError(err) || new Error('Unknown error');
      const {error_description} = error;
      if (
        (error_description && error_description.indexOf(`Can't find entity with id`) !== -1) ||
        error && (error.error === 'bad_request' || error.error === 'Bad Request')
      ) {
        flushStoragePart({projectId: null});
        dispatch(clearDraftProject());
      }

      notifyError('Cannot update issue draft', error);
    }
  };
}

export function initializeWithDraftOrProject(preDefinedDraftId: ?string) {
  return async (dispatch: (any) => any) => {
    if (preDefinedDraftId) {
      dispatch(setPredefinedDraftId(preDefinedDraftId));
    }
    const draftId = preDefinedDraftId || getStorageState().draftId;

    if (draftId) {
      log.info(`Initializing with draft ${draftId}`);
      await dispatch(loadIssueFromDraft(draftId));
      return;
    }
    log.info('Draft not found, initializing new draft');
    await dispatch(loadStoredProject());
  };
}

export function createIssue() {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    dispatch(startIssueCreation());

    try {
      await dispatch(updateIssueDraft());
      const created = await api.issue.createIssue(getState().creation.issue);
      log.info('Issue has been created');
      usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Success');

      const filledIssue = ApiHelper.fillIssuesFieldHash([created])[0];
      dispatch(issueCreated(filledIssue, getState().creation.predefinedDraftId));

      Router.pop();
      return await clearIssueDraftStorage();

    } catch (err) {
      usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Error');
      return notifyError('Cannot create issue', err);
    } finally {
      dispatch(stopIssueCreation());
    }
  };
}

export function attachImage(takeFromLibrary: boolean = true) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().creation;
    try {
      const attachingImage = await attachFile(takeFromLibrary ? 'openPicker' : 'openCamera');
      if (!attachingImage) {
        return;
      }
      dispatch(startImageAttaching(attachingImage));

      try {
        await api.issue.attachFile(issue.id, attachingImage.url, attachingImage.name);
        log.info('Image attached to draft');
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

export function updateProject(project: Object) {
  return async (dispatch: (any) => any, getState: () => Object) => {
    dispatch(setIssueProject(project));

    log.info('Project has been updated');
    usage.trackEvent(CATEGORY_NAME, 'Change project');
    dispatch(updateIssueDraft());
    storeProjectId(project.id);
  };
}

export function updateFieldValue(field: CustomField, value: FieldValue) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    dispatch(setIssueFieldValue(field, value));
    usage.trackEvent(CATEGORY_NAME, 'Change field value');
    log.info('Value of draft field has been changed successfully', {field, value});

    const api = getApi();
    const {issue} = getState().creation;

    try {
      await dispatch(updateIssueDraft(true)); // Update summary/description first
      await api.issue.updateIssueDraftFieldValue(issue.id, field.id, value);
      log.info(`Issue field value updated`);

      dispatch(loadIssueFromDraft(issue.id));
    } catch (err) {
      const error = await resolveError(err);
      notifyError('Cannot update field', error);
    }
  };
}

export function removeAttachment(attachment: Attachment) {
  return async (dispatch: (any) => any, getState: () => Object, getApi: ApiGetter) => {
    usage.trackEvent(CATEGORY_NAME, 'Remove attachment');

    const api = getApi();
    const {issue} = getState().creation;

    try {
      await api.issue.removeAttachment(issue.id, attachment.id);
      log.info(`Attachment ${attachment.id} removed from issue draft ${issue.id}`);
      dispatch({type: types.REMOVE_ATTACHMENT, attachment});
    } catch (err) {
      notifyError('Cannot remove attachment', err);
    }
  };
}
