import {ActionSheetProvider} from '@expo/react-native-action-sheet';

import * as commandDialogHelper from 'components/command-dialog/command-dialog-helper';
import ApiHelper from 'components/api/api__helper';
import issueCommonLinksActions from 'components/issue-actions/issue-links-actions';
import log from 'components/log/log';
import usage from 'components/usage/usage';
import {actions} from './create-issue-reducers';
import {ANALYTICS_ISSUE_CREATE_PAGE} from 'components/analytics/analytics-ids';
import {attachmentActions} from './create-issue__attachment-actions-and-types';
import {commandDialogTypes, ISSUE_CREATED} from './create-issue-action-types';
import {
  CUSTOM_ERROR_MESSAGE,
  DEFAULT_ERROR_MESSAGE,
} from 'components/error/error-messages';
import {getStorageState, flushStoragePart} from 'components/storage/storage';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {notifyError} from 'components/notification/notification';
import {resolveError} from 'components/error/error-resolver';
import {showActions} from 'components/action-sheet/action-sheet';

import type Api from 'components/api/api';
import type {ActionSheetOption} from 'components/action-sheet/action-sheet';
import type {AppState} from 'reducers';
import type {
  AnyIssue,
  CommandSuggestionResponse,
  IssueCreate,
  IssueOnList,
} from 'types/Issue';
import type {CreateIssueState} from './create-issue-reducers';
import type {
  CustomField,
  FieldValue,
  Attachment,
  CustomFieldText,
  IssueLink,
} from 'types/CustomFields';
import type {NormalizedAttachment} from 'types/Attachment';
import type {StorageState} from 'components/storage/storage';
import type {Visibility} from 'types/Visibility';
import {CustomError} from 'types/Error';
import {Folder} from 'types/User';

type ApiGetter = () => Api;

export const CATEGORY_NAME = 'Create issue view';

export function setIssueSummary(summary: string): CreateIssueState {
  return actions.setIssueSummary({
    summary,
  });
}

export function setIssueDescription(description: string): CreateIssueState {
  return actions.setIssueDescription({
    description,
  });
}

export function propagateCreatedIssue(
  issue: IssueCreate,
  preDefinedDraftId: string | null | undefined,
): {
  issue: IssueCreate;
  preDefinedDraftId: string | null | undefined;
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

export function storeDraftAndGoBack(): (
  dispatch: (arg0: any) => any,
) => Promise<void> {
  return async (dispatch: (arg0: any) => any) => {
    await dispatch(updateIssueDraft());
    //Hack: reset state after timeout to let router close the view without freezes
    setTimeout(() => dispatch(actions.resetCreation()), 500);
  };
}

export function loadStoredProject(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    ) => {
    let projectId: string | null | undefined = getStorageState().projectId;

    if (!projectId) {
      const searchContext: Partial<Folder> | null = getState().issueList?.searchContext;
      if (searchContext && hasType.project(searchContext)) {
        projectId = searchContext.id;
      }
    }

    if (projectId) {
      log.info(`Stored project loaded, id=${projectId}`);
      dispatch(
        actions.setDraftProjectId({
          projectId,
        }),
      );
      await dispatch(updateIssueDraft());
    }
  };
}

export function loadIssueFromDraft(
  draftId: string,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const api: Api = getApi();

    try {
      const draftIssue = await api.issue.loadIssueDraft(draftId);
      log.info(`Issue draft loaded, "${draftIssue.id || ''}"`);
      dispatch(
        actions.setIssueDraft({
          issue: draftIssue,
        }),
      );
    } catch (err) {
      log.info('Cannot load issue draft, cleaning up');
      clearIssueDraftStorage();
      dispatch(actions.resetIssueDraftId());
      dispatch(loadStoredProject());
    }
  };
}

export function applyCommand(
  command: string,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
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

export function updateIssueDraft(
  ignoreFields: boolean = false,
  draftData?: Record<string, any>,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
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
      const updatedDraftIssue: IssueCreate = await api.issue.updateIssueDraft(draftIssue);

      if (ignoreFields) {
        delete updatedDraftIssue.fields;
      }

      log.info('Issue draft updated', draftIssue.id);
      dispatch(
        actions.setIssueDraft({
          issue: updatedDraftIssue,
        }),
      );

      if (!getState().creation.predefinedDraftId) {
        await storeIssueDraftId(updatedDraftIssue.id);
      }
    } catch (err) {
      const error =
        (await resolveError(err as CustomError)) || new Error(DEFAULT_ERROR_MESSAGE);
      const {error_description} = error;

      if (
        (error_description &&
          error_description.indexOf(CUSTOM_ERROR_MESSAGE.NO_ENTITY_FOUND) !==
          -1) ||
        (error &&
          (error.error === 'bad_request' ||
            error.error === CUSTOM_ERROR_MESSAGE.BAD_REQUEST))
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

export function initializeWithDraftOrProject(
  preDefinedDraftId: string | null | undefined,
): (dispatch: (arg0: any) => any) => Promise<void> {
  return async (dispatch: (arg0: any) => any) => {
    if (preDefinedDraftId) {
      dispatch(
        actions.setIssuePredefinedDraftId({
          preDefinedDraftId,
        }),
      );
    }

    const draftId = preDefinedDraftId || getStorageState().draftId;

    if (draftId) {
      log.info(`Initializing with draft ${draftId}`);
      await dispatch(loadIssueFromDraft(draftId));
      dispatch(
        actions.setIssueLinks({
          links: await dispatch(loadIssueLinksTitle()),
        }),
      );
    } else {
      log.info('Draft not found, initializing new draft');
      await dispatch(loadStoredProject());
    }
  };
}

export function createIssue(
  onHide: () => any,
  isMatchesQuery: (issueIdReadable: string) => boolean = () => true,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const api: Api = getApi();
    dispatch(actions.startIssueCreation());

    try {
      await dispatch(updateIssueDraft(true));
      const created = await api.issue.createIssue(getState().creation.issue);
      log.info('Issue has been created');
      usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Success');
      const isMatches: boolean = await isMatchesQuery(created.idReadable);

      if (isMatches) {
        const filledIssue: AnyIssue = ApiHelper.fillIssuesFieldHash([
          created,
        ])[0];
        dispatch(
          propagateCreatedIssue(
            filledIssue,
            getState().creation.predefinedDraftId,
          ),
        );
      }

      dispatch(actions.resetCreation());
      onHide();
      clearIssueDraftStorage();
    } catch (err) {
      usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Error');
      notifyError(err as CustomError);
    } finally {
      dispatch(actions.stopIssueCreation());
    }
  };
}

export function updateProject(
  project: Record<string, any>,
): (dispatch: (arg0: any) => any, getState: () => any) => Promise<void> {
  return async (dispatch: (arg0: any) => any, getState: () => AppState) => {
    dispatch(
      actions.setIssueProject({
        project,
      }),
    );
    log.info('Project has been updated');
    usage.trackEvent(CATEGORY_NAME, 'Change project');
    dispatch(
      updateIssueDraft(false, {
        fields: [],
      }),
    );
    storeProjectId(project.id);
  };
}

export function updateFieldValue(
  field: CustomField | CustomFieldText,
  value: Partial<FieldValue>,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    dispatch(
      actions.setIssueFieldValue({
        field,
        value,
      }),
    );
    usage.trackEvent(CATEGORY_NAME, 'Change field value');
    log.info('Value of draft field has been changed successfully', {
      field,
      value,
    });
    const api = getApi();
    const {issue} = getState().creation;

    try {
      await dispatch(updateIssueDraft(true)); // Update summary/description first

      await api.issue.updateIssueDraftFieldValue(issue.id, field.id, value);
      log.info('Issue field value updated');
      dispatch(loadIssueFromDraft(issue.id));
    } catch (err) {
      notifyError(err as CustomError);
    }
  };
}

export function uploadIssueAttach(
  files: NormalizedAttachment[],
): (dispatch: (arg0: any) => any, getState: () => any) => Promise<void> {
  return async (dispatch: (arg0: any) => any, getState: () => AppState) => {
    const draft: IssueCreate = getState().creation.issue;
    await dispatch(attachmentActions.doUploadFile(false, files, draft));
  };
}

export function cancelAddAttach(
  attach: Attachment,
): (dispatch: (arg0: any) => any) => Promise<void> {
  return async (dispatch: (arg0: any) => any) => {
    await dispatch(attachmentActions.cancelImageAttaching(attach));
  };
}

export function loadAttachments(): (
  dispatch: (arg0: any) => any,
  getState: () => any,
) => Promise<void> {
  return async (dispatch: (arg0: any) => any, getState: () => AppState) => {
    const draftId = getState().creation.issue.id;
    dispatch(attachmentActions.loadIssueAttachments(draftId));
  };
}

export function showAddAttachDialog(): (
  dispatch: (arg0: any) => any,
) => Promise<void> {
  return async (dispatch: (arg0: any) => any) => {
    dispatch(attachmentActions.toggleAttachFileDialog(true));
  };
}

export function hideAddAttachDialog(): (
  dispatch: (arg0: any) => any,
) => Promise<void> {
  return async (dispatch: (arg0: any) => any) => {
    dispatch(attachmentActions.toggleAttachFileDialog(false));
  };
}

export function removeAttachment(
  attach: Attachment,
): (dispatch: (arg0: any) => any, getState: () => any) => Promise<void> {
  return async (dispatch: (arg0: any) => any, getState: () => AppState) => {
    const draftId = getState().creation.issue.id;
    dispatch(attachmentActions.removeAttachment(attach, draftId));
  };
}

export function updateVisibility(
  visibility: Visibility,
): (
  dispatch: (arg0: any) => any,
  getState: () => any,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const draftIssue: IssueCreate = getState().creation.issue;
    const draftIssueCopy: IssueCreate = {...draftIssue};

    try {
      const draftWithVisibility: Visibility = await getApi().issue.updateVisibility(
        draftIssue.id,
        visibility,
      );
      dispatch(
        actions.setIssueDraft({
          issue: draftWithVisibility,
        }),
      );
    } catch (err) {
      dispatch(
        actions.setIssueDraft({
          issue: draftIssueCopy,
        }),
      );
      notifyError(err as CustomError);
    }
  };
}

export function showContextActions(
  actionSheet: typeof ActionSheetProvider,
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
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
      actionSheet,
    );

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function getCommandSuggestions(
  command: string,
  caret: number,
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
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

export function toggleCommandDialog(
  isVisible: boolean = false,
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    dispatch({
      type: isVisible
        ? commandDialogTypes.OPEN_COMMAND_DIALOG
        : commandDialogTypes.CLOSE_COMMAND_DIALOG,
    });
  };
}

export function loadIssuesXShort(
  linkTypeName: string,
  query: string = '',
  page?: number,
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<IssueOnList> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const issue: IssueCreate = getState().creation.issue;
    const searchQuery: string = encodeURIComponent(
      [
        `(project:${issue.project.shortName})`,
        query.length > 0 ? `(${query})` : '',
      ]
        .filter(Boolean)
        .join(' and '),
    );
    return await issueCommonLinksActions(issue).loadIssuesXShort(
      searchQuery,
      page,
    );
  };
}

export function onLinkIssue(
  linkedIssueIdReadable: string,
  linkTypeName: string,
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<boolean> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const issue: IssueCreate = getState().creation.issue;
    usage.trackEvent(ANALYTICS_ISSUE_CREATE_PAGE, 'Link issue');
    return await issueCommonLinksActions(issue).onLinkIssue(
      linkedIssueIdReadable,
      linkTypeName,
    );
  };
}

export function loadLinkedIssues(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<Array<IssueLink>> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const issue: IssueCreate = getState().creation.issue;
    return await issueCommonLinksActions(issue).loadLinkedIssues();
  };
}

export function onUnlinkIssue(
  linkedIssue: IssueOnList,
  linkTypeId: string,
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<boolean> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const issue: IssueCreate = getState().creation.issue;
    usage.trackEvent(ANALYTICS_ISSUE_CREATE_PAGE, 'Remove linked issue');
    return issueCommonLinksActions(issue).onUnlinkIssue(
      linkedIssue,
      linkTypeId,
    );
  };
}

export function loadIssueLinksTitle(): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<Array<IssueLink>> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const issue: IssueCreate = getState().creation.issue;
    return await issueCommonLinksActions(issue).loadIssueLinksTitle();
  };
}

export function getIssueLinksTitle(
  links?: IssueLink[],
): (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<void> {
  return async (
    dispatch: (arg0: any) => any,
    getState: () => AppState,
    getApi: ApiGetter,
  ) => {
    const issue: IssueCreate = getState().creation.issue;
    dispatch(
      actions.setIssueLinks({
        links: await issueCommonLinksActions(issue).getIssueLinksTitle(links),
      }),
    );
  };
}
