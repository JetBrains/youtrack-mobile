import {ActionSheetProvider} from '@expo/react-native-action-sheet';

import * as commandDialogHelper from 'components/command-dialog/command-dialog-helper';
import issueCommonLinksActions from 'components/issue-actions/issue-links-actions';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {actions} from './create-issue-reducers';
import {ANALYTICS_ISSUE_CREATE_PAGE} from 'components/analytics/analytics-ids';
import {attachmentActions} from './create-issue__attachment-actions-and-types';
import {commandDialogTypes, ISSUE_CREATED} from './create-issue-action-types';
import {CUSTOM_ERROR_MESSAGE, DEFAULT_ERROR_MESSAGE} from 'components/error/error-messages';
import {getStorageState, flushStoragePart} from 'components/storage/storage';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {notifyError} from 'components/notification/notification';
import {resolveError} from 'components/error/error-resolver';
import {showActions} from 'components/action-sheet/action-sheet';
import {until} from 'util/util';

import type Api from 'components/api/api';
import type {ActionSheetOption} from 'components/action-sheet/action-sheet';
import type {AnyIssue, CommandSuggestionResponse, IssueCreate, IssueOnList} from 'types/Issue';
import type {CustomError} from 'types/Error';
import type {CustomField, FieldValue, Attachment, CustomFieldText, IssueLink} from 'types/CustomFields';
import type {Folder} from 'types/User';
import type {NormalizedAttachment} from 'types/Attachment';
import type {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';
import type {StorageState} from 'components/storage/storage';
import type {Visibility} from 'types/Visibility';

export const CATEGORY_NAME = 'Create issue view';

export function setIssueSummary(summary: string) {
  return actions.setIssueSummary({summary});
}

export function setIssueDescription(description: string) {
  return actions.setIssueDescription({description});
}

export function propagateCreatedIssue(
  issue: IssueCreate,
  preDefinedDraftId?: string | null
): {
  issue: IssueCreate;
  preDefinedDraftId?: string | null;
  type: string;
} {
  return {
    type: ISSUE_CREATED,
    issue,
    preDefinedDraftId,
  };
}

async function clearIssueDraftStorage(): Promise<StorageState> {
  return await flushStoragePart({
    draftId: null,
  });
}

export async function storeProjectId(projectId: string): Promise<StorageState> {
  return await flushStoragePart({
    projectId,
  });
}

async function storeIssueDraftId(draftId: string): Promise<StorageState> {
  return await flushStoragePart({
    draftId,
  });
}

export function storeDraftAndGoBack(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    await dispatch(updateIssueDraft());
    //Hack: reset state after timeout to let router close the view without freezes
    setTimeout(() => dispatch(actions.resetCreation()), 500);
  };
}

export function loadStoredProject(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    let projectId: string | null | undefined = getStorageState().projectId;

    if (!projectId) {
      const searchContext: Partial<Folder> | null = getState().issueList?.searchContext;
      if (searchContext && hasType.project(searchContext)) {
        projectId = searchContext.id;
      }
    }

    if (projectId) {
      log.info(`Create Issue Actions: Last stored project loaded`);
      dispatch(actions.setDraftProjectId({projectId}));
      await dispatch(updateIssueDraft());
    }
  };
}

export function loadIssueFromDraft(draftId: string): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const api: Api = getApi();

    try {
      const draftIssue = await api.issue.loadIssueDraft(draftId);
      log.info(`Create Issue Actions: Issue draft loaded`);
      dispatch(actions.setIssueDraft({issue: draftIssue}));
    } catch (err) {
      log.info('Create Issue Actions: Cannot load issue draft, cleaning up');
      clearIssueDraftStorage();
      dispatch(actions.resetIssueDraftId());
      dispatch(loadStoredProject());
    }
  };
}

export function applyCommand(command: string): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const draftId = getState().creation.issue.id;
    dispatch({
      type: commandDialogTypes.START_APPLYING_COMMAND,
    });
    await commandDialogHelper
      .applyCommand([draftId], command)
      .then(async () => {
        dispatch(toggleCommandDialog(false));
        await dispatch(loadIssueFromDraft(draftId));
      })
      .finally(() => {
        dispatch({
          type: commandDialogTypes.STOP_APPLYING_COMMAND,
        });
      });
  };
}

export function updateIssueDraft(ignoreFields: boolean = false, draftData?: Record<string, any>): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const api: Api = getApi();
    const {issue} = getState().creation;

    if (!issue || !issue.project || !issue.project.id) {
      return;
    }

    const draftIssue = {
      id: issue.id,
      summary: issue.summary,
      description: issue.description,
      project: issue.project,
      fields: ignoreFields ? undefined : issue.fields,
      ...draftData,
    } as unknown as IssueCreate;

    try {
      const updatedDraftIssue = await api.issue.updateIssueDraft(draftIssue);

      if (ignoreFields) {
        delete updatedDraftIssue.fields;
      }

      log.info('Create Issue Actions: Issue draft updated');
      dispatch(actions.setIssueDraft({issue: updatedDraftIssue}));

      if (!getState().creation.predefinedDraftId) {
        await storeIssueDraftId(updatedDraftIssue.id);
      }
    } catch (err) {
      const error = (await resolveError(err as CustomError)) || new Error(DEFAULT_ERROR_MESSAGE);
      const {error_description} = error;

      if (
        (error_description && error_description.indexOf(CUSTOM_ERROR_MESSAGE.NO_ENTITY_FOUND) !== -1) ||
        (error && (error.error === 'bad_request' || error.error === CUSTOM_ERROR_MESSAGE.BAD_REQUEST))
      ) {
        flushStoragePart({
          projectId: null,
        });
        dispatch(actions.clearDraftProject());
      }

      notifyError(error);
    }
  };
}

export function initializeWithDraftOrProject(preDefinedDraftId: string | null): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    if (preDefinedDraftId) {
      dispatch(actions.setIssuePredefinedDraftId({preDefinedDraftId}));
    }

    const draftId = preDefinedDraftId || getStorageState().draftId;

    if (draftId) {
      log.info(`Create Issue Actions: Initializing with draft`);
      await dispatch(loadIssueFromDraft(draftId));
      dispatch(actions.setIssueLinks({links: await dispatch(loadIssueLinksTitle())}));
      dispatch(initAndSetIssueDrafts());
    } else {
      log.info('Create Issue Actions: Draft not found, initializing new draft');
      await dispatch(loadStoredProject());
    }
  };
}

export function initAndSetIssueDrafts(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const [error, drafts] = await until(getApi().issue.getUserIssueDrafts());
    if (!error && drafts) {
      dispatch(
        actions.setUserDrafts({
          drafts: drafts.filter((it: AnyIssue) => it.id !== getState().creation.issue.id),
        })
      );
    }
  };
}

export function deleteAllDrafts(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const [error] = await until(getApi().issue.deleteAllIssueDraftsExcept(getState().creation.issue.id));
    if (!error) {
      dispatch(initAndSetIssueDrafts());
    }
  };
}

export function deleteDraft(draftId: string): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const [error] = await until(getApi().issue.deleteDraft(draftId));
    if (!error) {
      await dispatch(initAndSetIssueDrafts());
    }
  };
}

export function createIssue(
  onHide: () => unknown = () => {},
  isMatchesQuery: (issueIdReadable: string) => boolean = () => true
): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    dispatch(actions.startIssueCreation());
    await dispatch(updateIssueDraft(true));
    const [err, created] = await until(getApi().issue.createIssue(getState().creation.issue.id));
    if (err) {
      usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Error');
      notifyError(err);
    } else {
      log.info('Create Issue Actions: Issue has been created');
      usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Success');
      const isMatches: boolean = await isMatchesQuery(created.idReadable);

      if (isMatches) {
        dispatch(propagateCreatedIssue(created, getState().creation.predefinedDraftId));
      }

      dispatch(actions.resetCreation());
      onHide();
      clearIssueDraftStorage();
    }
    dispatch(actions.stopIssueCreation());
  };
}

export function updateProject(project: Record<string, any>): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(actions.setIssueProject({project}));
    log.info('Create Issue Actions: Project has been updated');
    usage.trackEvent(CATEGORY_NAME, 'Change project');
    dispatch(updateIssueDraft(false, {fields: []}));
    storeProjectId(project.id);
  };
}

export function updateFieldValue(field: CustomField | CustomFieldText, value: Partial<FieldValue>): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    dispatch(actions.setIssueFieldValue({field, value}));
    usage.trackEvent(CATEGORY_NAME, 'Change field value');
    log.info('Create Issue Actions: Value of draft field has been changed successfully');
    const api = getApi();
    const {issue} = getState().creation;

    try {
      await dispatch(updateIssueDraft(true)); // Update summary/description first

      await api.issue.updateIssueDraftFieldValue(issue.id, field.id, value);
      log.info('Create Issue Actions: Issue field value updated');
      dispatch(loadIssueFromDraft(issue.id));
    } catch (err) {
      notifyError(err as CustomError);
    }
  };
}

export function uploadIssueAttach(files: NormalizedAttachment[]): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const draft: IssueCreate = getState().creation.issue;
    await dispatch(attachmentActions.doUploadFile(false, files, draft));
  };
}

export function cancelAddAttach(attach: Attachment): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    await dispatch(attachmentActions.cancelImageAttaching(attach));
  };
}

export function loadAttachments(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const draftId = getState().creation.issue.id;
    dispatch(attachmentActions.loadIssueAttachments(draftId));
  };
}

export function showAddAttachDialog(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(attachmentActions.toggleAttachFileDialog(true));
  };
}

export function hideAddAttachDialog(): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    dispatch(attachmentActions.toggleAttachFileDialog(false));
  };
}

export function removeAttachment(attach: Attachment): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const draftId = getState().creation.issue.id;
    dispatch(attachmentActions.removeAttachment(attach, draftId));
  };
}

export function updateVisibility(visibility: Visibility): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const draftIssue: IssueCreate = getState().creation.issue;
    const draftIssueCopy: IssueCreate = {...draftIssue};

    try {
      const draftWithVisibility: Visibility = await getApi().issue.updateVisibility(draftIssue.id, visibility);
      dispatch(actions.setIssueDraft({issue: draftWithVisibility}));
    } catch (err) {
      dispatch(actions.setIssueDraft({issue: draftIssueCopy}));
      notifyError(err as CustomError);
    }
  };
}

export function showContextActions(actionSheet: typeof ActionSheetProvider): ReduxAction {
  return async (dispatch: ReduxThunkDispatch) => {
    const selectedAction: ActionSheetOption = await showActions(
      [
        {
          title: i18n('Apply command…'),
          execute: () => {
            dispatch(toggleCommandDialog(true));
            usage.trackEvent(ANALYTICS_ISSUE_CREATE_PAGE, 'Apply command');
          },
        },
        {
          title: i18n('Cancel'),
        },
      ],
      actionSheet
    );

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function getCommandSuggestions(command: string, caret: number): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const issueId = getState().creation.issue.id;
    await commandDialogHelper
      .loadIssueCommandSuggestions([issueId], command, caret)
      .then((suggestions: CommandSuggestionResponse | null) => {
        suggestions &&
          dispatch({
            type: commandDialogTypes.RECEIVE_COMMAND_SUGGESTIONS,
            suggestions,
          });
      })
      .catch(() => {
        //
      });
  };
}

export function toggleCommandDialog(isVisible: boolean = false): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    dispatch({
      type: isVisible ? commandDialogTypes.OPEN_COMMAND_DIALOG : commandDialogTypes.CLOSE_COMMAND_DIALOG,
    });
  };
}

export function loadIssuesXShort(
  linkTypeName: string,
  query: string = '',
  page?: number
): ReduxAction<Promise<IssueOnList>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const issue: IssueCreate = getState().creation.issue;
    const searchQuery: string = encodeURIComponent(
      [`(project:${issue.project.shortName})`, query.length > 0 ? `(${query})` : ''].filter(Boolean).join(' and ')
    );
    return await issueCommonLinksActions(issue).loadIssuesXShort(searchQuery, page);
  };
}

export function onLinkIssue(linkedIssueIdReadable: string, linkTypeName: string): ReduxAction<Promise<boolean>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const issue: IssueCreate = getState().creation.issue;
    usage.trackEvent(ANALYTICS_ISSUE_CREATE_PAGE, 'Link issue');
    return await issueCommonLinksActions(issue).onLinkIssue(linkedIssueIdReadable, linkTypeName);
  };
}

export function loadLinkedIssues(): ReduxAction<Promise<Array<IssueLink>>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const issue: IssueCreate = getState().creation.issue;
    return await issueCommonLinksActions(issue).loadLinkedIssues();
  };
}

export function onUnlinkIssue(
  linkedIssue: IssueOnList,
  linkTypeId: string
): ReduxAction<Promise<boolean>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const issue: IssueCreate = getState().creation.issue;
    usage.trackEvent(ANALYTICS_ISSUE_CREATE_PAGE, 'Remove linked issue');
    return issueCommonLinksActions(issue).onUnlinkIssue(linkedIssue, linkTypeId);
  };
}

export function loadIssueLinksTitle(): ReduxAction<Promise<Array<IssueLink>>> {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const issue: IssueCreate = getState().creation.issue;
    return await issueCommonLinksActions(issue).loadIssueLinksTitle();
  };
}

export function getIssueLinksTitle(links?: IssueLink[]): ReduxAction {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const issue: IssueCreate = getState().creation.issue;
    dispatch(actions.setIssueLinks({links: await issueCommonLinksActions(issue).getIssueLinksTitle(links)}));
  };
}
