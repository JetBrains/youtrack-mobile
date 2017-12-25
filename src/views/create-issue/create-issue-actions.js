/* @flow */
import {AsyncStorage} from 'react-native';
import type Api from '../../components/api/api';
import ApiHelper from '../../components/api/api__helper';
import type {IssueFull} from '../../flow/Issue';
import type {CustomField, FieldValue} from '../../flow/CustomFields';
import usage from '../../components/usage/usage';
import * as types from './create-issue-action-types';
import Router from '../../components/router/router';
import log from '../../components/log/log';
import attachFile from '../../components/attach-file/attach-file';
import {notifyError, resolveError} from '../../components/notification/notification';

const PROJECT_ID_STORAGE_KEY = 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE';
const DRAFT_ID_STORAGE_KEY = 'DRAFT_ID_STORAGE_KEY';
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

function clearIssueDraftStorage() {
  AsyncStorage.removeItem(DRAFT_ID_STORAGE_KEY);
}

function storeProjectId(projectId: string) {
  AsyncStorage.setItem(PROJECT_ID_STORAGE_KEY, projectId);
}

async function storeIssueDraftId(issueId: string) {
  return await AsyncStorage.setItem(DRAFT_ID_STORAGE_KEY, issueId);
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
    const projectId = await AsyncStorage.getItem(PROJECT_ID_STORAGE_KEY);
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
      const issue = await api.loadIssueDraft(draftId);
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

export function updateIssueDraft() {
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
      const issue = await api.updateIssueDraft(issueToSend);
      log.info('Issue draft updated', issueToSend);
      dispatch(setIssueDraft(issue));
      if (!getState().creation.predefinedDraftId) {
        return await storeIssueDraftId(issue.id);
      }
    } catch (err) {
      const error = await resolveError(err);
      if (error && error.error_description && error.error_description.indexOf(`Can't find entity with id`) !== -1) {
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
    const draftId = preDefinedDraftId || (await AsyncStorage.getItem(DRAFT_ID_STORAGE_KEY));

    if (draftId) {
      log.info(`INitializing with draft ${draftId}`);
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
      const created = await api.createIssue(getState().creation.issue);
      log.info('Issue has been created');
      usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Success');

      const filledIssue = ApiHelper.fillIssuesFieldHash([created])[0];
      dispatch(issueCreated(filledIssue, getState().creation.predefinedDraftId));

      Router.pop();
      return await AsyncStorage.removeItem(DRAFT_ID_STORAGE_KEY);

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
      const attachingImage = await attachFile(takeFromLibrary ? 'launchImageLibrary' : 'launchCamera');
      dispatch(startImageAttaching(attachingImage));

      try {
        await api.attachFile(issue.id, attachingImage.url, attachingImage.name);
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
      await dispatch(updateIssueDraft()); // Update summary/description first
      await api.updateIssueDraftFieldValue(issue.id, field.id, value);
      log.info(`Issue field value updated`);

      dispatch(loadIssueFromDraft(issue.id));
    } catch (err) {
      const error = await resolveError(err);
      notifyError('Cannot update field', error);
    }
  };
}
