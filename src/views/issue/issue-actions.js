/* @flow */

import {Clipboard, Share} from 'react-native';

import * as commandDialogHelper from '../../components/command-dialog/command-dialog-helper';
import * as types from './issue-action-types';
import ApiHelper from '../../components/api/api__helper';
import issueCommonLinksActions from '../../components/issue-actions/issue-links-actions';
import log from '../../components/log/log';
import Router from '../../components/router/router';
import usage from '../../components/usage/usage';
import {ANALYTICS_ISSUE_PAGE} from '../../components/analytics/analytics-ids';
import {attachmentActions, attachmentTypes} from './issue__attachment-actions-and-types';
import {getEntityPresentation, getReadableID} from '../../components/issue-formatter/issue-formatter';
import {getIssueTextCustomFields} from '../../components/custom-field/custom-field-helper';
import {initialState} from './issue-reducers';
import {isIOSPlatform, until} from '../../util/util';
import {logEvent} from '../../components/log/log-helper';
import {notify, notifyError} from '../../components/notification/notification';
import {receiveUserAppearanceProfile} from '../../actions/app-actions';
import {resolveError, resolveErrorMessage} from '../../components/error/error-resolver';
import {showActions} from '../../components/action-sheet/action-sheet';

import type ActionSheet from '@expo/react-native-action-sheet';
import type Api from '../../components/api/api';
import type {Attachment, CustomField, CustomFieldText, FieldValue, IssueProject, Tag} from '../../flow/CustomFields';
import type {CommandSuggestionResponse, IssueFull, IssueOnList, OpenNestedViewParams} from '../../flow/Issue';
import type {IssueLink} from '../../flow/CustomFields';
import type {NormalizedAttachment} from '../../flow/Attachment';
import type {State as IssueState} from './issue-reducers';
import type {UserAppearanceProfile} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';
import type {AppState} from '../../reducers';

type ApiGetter = () => Api;
type StateGetter = () => { issueState: IssueState };

export function setIssueId(issueId: string): {issueId: string, type: any} {
  return {type: types.SET_ISSUE_ID, issueId};
}

export function startIssueRefreshing(): {type: any} {
  return {type: types.START_ISSUE_REFRESHING};
}

export function stopIssueRefreshing(): {type: any} {
  return {type: types.STOP_ISSUE_REFRESHING};
}

export function receiveIssue(issue: IssueFull): {issue: IssueFull, type: any} {
  return {type: types.RECEIVE_ISSUE, issue};
}

export function setIssueFieldValue(field: CustomField, value: FieldValue): {field: CustomField, type: any, value: FieldValue} {
  return {type: types.SET_ISSUE_FIELD_VALUE, field, value};
}

export function setProject(project: IssueProject): {project: IssueProject, type: any} {
  return {type: types.SET_PROJECT, project};
}

export function startEditingIssue(): {type: any} {
  return {type: types.START_EDITING_ISSUE};
}

export function stopEditingIssue(): {type: any} {
  return {type: types.STOP_EDITING_ISSUE};
}

export function setIssueSummaryAndDescription(summary: string, description: string): {description: string, summary: string, type: any} {
  return {type: types.SET_ISSUE_SUMMARY_AND_DESCRIPTION, summary, description};
}

export function setIssueSummaryCopy(summary: string): {summary: string, type: any} {
  return {type: types.SET_ISSUE_SUMMARY_COPY, summary};
}

export function setIssueDescriptionCopy(description: string): {description: string, type: any} {
  return {type: types.SET_ISSUE_DESCRIPTION_COPY, description};
}

export function startSavingEditedIssue(): {type: any} {
  return {type: types.START_SAVING_EDITED_ISSUE};
}

export function stopSavingEditedIssue(): {type: any} {
  return {type: types.STOP_SAVING_EDITED_ISSUE};
}

export function setVoted(voted: boolean): {type: any, voted: boolean} {
  return {type: types.SET_VOTED, voted};
}

export function setStarred(starred: boolean): {starred: boolean, type: any} {
  return {type: types.SET_STARRED, starred};
}

export function issueUpdated(issue: IssueFull): {issue: IssueFull, type: any} {
  return {type: types.ISSUE_UPDATED, issue};
}

export function resetIssueView(): {type: any} {
  return {type: types.RESET_SINGLE_ISSUE};
}

export function unloadActiveIssueView(): {type: any} {
  return {type: types.UNLOAD_ACTIVE_ISSUE_VIEW};
}

export function openCommandDialog(initialCommand: string = ''): {initialCommand: string, type: any} {
  return {type: types.commandDialogTypes.OPEN_COMMAND_DIALOG, initialCommand};
}

export function closeCommandDialog(): {type: any} {
  return {type: types.commandDialogTypes.CLOSE_COMMAND_DIALOG};
}

export function receiveCommandSuggestions(suggestions: CommandSuggestionResponse): {suggestions: CommandSuggestionResponse, type: any} {
  return {type: types.commandDialogTypes.RECEIVE_COMMAND_SUGGESTIONS, suggestions};
}

export function startApplyingCommand(): {type: any} {
  return {type: types.commandDialogTypes.START_APPLYING_COMMAND};
}

export function stopApplyingCommand(): {type: any} {
  return {type: types.commandDialogTypes.STOP_APPLYING_COMMAND};
}

export function receiveIssueVisibility(visibility: Visibility): {type: any, visibility: Visibility} {
  return {type: types.RECEIVE_ISSUE_VISIBILITY, visibility};
}

export function loadIssueAttachments(): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issueId;
    if (!issueId) {
      return;
    }

    try {
      const attachments = await getApi().issue.getIssueAttachments(issueId);
      dispatch({
        type: attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS,
        attachments,
      });
    } catch (error) {
      log.warn('Failed to load issue attachments', error);
    }
  };
}

export function loadIssue(): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<IssueFull | void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issueId;
    const api: Api = getApi();

    try {
      if (!issueId) {
        throw new Error('Attempt to load issue with no ID');
      }
      log.debug(`Loading issue "${issueId}"`);
      const issue = await api.issue.getIssue(issueId);
      log.info(`Issue "${issueId}" loaded`);
      issue.fieldHash = ApiHelper.makeFieldHash(issue);

      dispatch(setIssueId(issue.id)); //Set issue ID again because first one could be readable like YTM-111
      dispatch(receiveIssue(issue));
      dispatch(getIssueLinksTitle());
      return issue;
    } catch (rawError) {
      const error = await resolveError(rawError);
      dispatch({type: types.RECEIVE_ISSUE_ERROR, error});
      log.warn('Failed to load issue', error);
    }
  };
}

export function loadIssueLinksTitle(): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<Array<IssueLink>>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issue: IssueFull = getState().issueState.issue;
    return await issueCommonLinksActions(issue).loadIssueLinksTitle();
  };
}

export function getIssueLinksTitle(links?: Array<IssueLink>): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch({
      type: types.RECEIVE_ISSUE_LINKS,
      issueLinks: links || await dispatch(loadIssueLinksTitle()),
    });
  };
}

export function loadLinkedIssues(): ((
  dispatch: (any) => any,
  getState: () => AppState,
  getApi: ApiGetter,
) => Promise<Array<IssueLink>>) {
  return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Load linked issue');
    const issue: IssueFull = getState().issueState.issue;
    return await issueCommonLinksActions(issue).loadLinkedIssues();
  };
}

export function onUnlinkIssue(linkedIssue: IssueOnList, linkTypeId: string): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter,
) => Promise<boolean>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issue: IssueFull = getState().issueState.issue;
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Remove linked issue');
    return issueCommonLinksActions(issue).onUnlinkIssue(linkedIssue, linkTypeId);
  };
}

export function loadIssuesXShort(linkTypeName: string, query: string, page?: number): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter,
) => Promise<IssueOnList>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Search to link issues');
    const issue: IssueFull = getState().issueState.issue;
    return await issueCommonLinksActions(issue).loadIssuesXShort(
      linkTypeName,
      `(${query})+and+(${linkTypeName.split(' ').join('+')}:+-${getReadableID(issue)})`,
      page
    );
  };
}

export function onLinkIssue(linkedIssueIdReadable: string, linkTypeName: string): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter,
) => Promise<boolean>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issue: IssueFull = getState().issueState.issue;
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Link issue');
    return await issueCommonLinksActions(issue).onLinkIssue(linkedIssueIdReadable, linkTypeName);
  };
}

export function refreshIssue(): ((dispatch: (any) => any, getState: StateGetter) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    dispatch(startIssueRefreshing());
    try {
      const successMessage = 'Issue updated';
      await dispatch(loadIssue());
      notify(successMessage);
      log.debug(`${successMessage} "${getState().issueState.issueId}" loaded`);
    } catch (error) {
      const errorMessage = 'Cannot update issue';
      notify(errorMessage, error);
    } finally {
      dispatch(stopIssueRefreshing());
    }
  };
}

export function saveIssueSummaryAndDescriptionChange(): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().issueState;
    const {summaryCopy, descriptionCopy} = getState().issueState;
    const textCustomFields: Array<CustomFieldText> = getIssueTextCustomFields(issue.fields);

    dispatch(setIssueSummaryAndDescription(summaryCopy, descriptionCopy));
    dispatch(startSavingEditedIssue());

    try {
      await api.issue.saveIssueSummaryAndDescriptionChange(
        issue.id,
        summaryCopy,
        descriptionCopy,
        textCustomFields.length > 0 ? textCustomFields : undefined,
      );
      log.info(`Issue (${issue.id}) summary/description has been updated`);
      usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update issue', 'Success');

      await dispatch(loadIssue());
      dispatch(stopEditingIssue());
      dispatch(issueUpdated(getState().issueState.issue));
    } catch (err) {
      notifyError('Failed to update issue', err);
    } finally {
      dispatch(stopSavingEditedIssue());
    }
  };
}

export function onCheckboxUpdate(checked: boolean, position: number, description: string): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().issueState;
    const preIssueDescription: string = issue.description;
    dispatch(setIssueSummaryAndDescription(issue.summary, description));

    const textCustomFields: Array<CustomFieldText> = getIssueTextCustomFields(issue.fields);
    const [error] = await until(api.issue.saveIssueSummaryAndDescriptionChange(
      issue.id,
      issue.summary,
      description,
      textCustomFields.length > 0 ? textCustomFields : undefined,
    ));

    if (error) {
      dispatch(setIssueSummaryAndDescription(issue.summary, preIssueDescription));
      const message: string = 'Failed to update a checkbox';
      notify(message);
      logEvent({
        message,
        isError: true,
        analyticsId: ANALYTICS_ISSUE_PAGE,
      });
    } else {
      usage.trackEvent(ANALYTICS_ISSUE_PAGE, `Checkbox: ${checked ? 'checked' : 'unchecked'}`);
    }
  };
}

export function setCustomFieldValue(field: CustomField, value: FieldValue): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter,
) => Promise<void>) {
  return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update field value');
    dispatch(setIssueFieldValue(field, value));
  };
}

export function updateIssueFieldValue(field: CustomField, value: FieldValue): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const issue: IssueFull = getState().issueState.issue;

    dispatch(setCustomFieldValue(field, value));
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
      dispatch(issueUpdated(getState().issueState.issue));
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

export function updateProject(project: IssueProject): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update project');

    const api: Api = getApi();
    const {issue} = getState().issueState;
    dispatch(setProject(project));

    try {
      await api.issue.updateProject(issue, project);
      log.info('Project updated');
      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().issueState.issue));
    } catch (err) {
      notifyError('Failed to update issue project', err);
      dispatch(loadIssue());
    }
  };
}

export function toggleVote(voted: boolean): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().issueState;
    dispatch(setVoted(voted));
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, `Vote: ${voted ? 'voted' : 'unvoted'}`);
    try {
      await api.issue.updateIssueVoted(issue.id, voted);
    } catch (err) {
      const errorMessage: string = await resolveErrorMessage(err);
      notify(errorMessage || 'Cannot vote');
      dispatch(setVoted(!voted));
    }
  };
}

export function toggleStar(starred: boolean): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().issueState;

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

export function showIssueActions(
  actionSheet: ActionSheet,
  permissions: { canAttach: boolean, canEdit: boolean, canApplyCommand: boolean, canTag: boolean},
  switchToDetailsTab: () => any,
  renderLinkIssues?: () => any,
): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().issueState;

    const actions = [
      {
        title: 'Share…',
        execute: () => {
          const url = makeIssueWebUrl(api, issue);
          if (isIOSPlatform()) {
            Share.share({url});
          } else {
            Share.share({title: issue.summary, message: url}, {dialogTitle: 'Share URL'});
          }
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Share URL');
        },
      },
      {
        title: 'Copy URL',
        execute: () => {
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy URL');
          Clipboard.setString(makeIssueWebUrl(api, issue));
          notify('URL copied');
        },
      },
    ];

    if (permissions.canEdit) {
      actions.push({
        title: 'Edit',
        execute: () => {
          dispatch(startEditingIssue());
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Edit issue');
        },
      });
    }

    if (permissions.canTag) {
      actions.push({
        title: 'Add tag',
        execute: () => {
          dispatch(onOpenTagsSelect());
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Add tag');
        },
      });
    }

    if (permissions.canAttach) {
      actions.push({
        title: 'Attach file',
        execute: () => {
          switchToDetailsTab();
          dispatch(attachmentActions.toggleAttachFileDialog(true));
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Attach file');
        },
      });
    }

    if (typeof renderLinkIssues === 'function') {
      actions.push({
        title: 'Link issue',
        execute: () => {
          Router.Page({
            children: renderLinkIssues(),
          });
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Link issue');
        },
      });
    }

    if (permissions.canApplyCommand) {
      actions.push({
        title: 'Apply command…',
        execute: () => {
          dispatch(openCommandDialog());
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Apply command');
        },
      });
    }

    actions.push({title: 'Cancel'});

    const selectedAction = await showActions(
      actions,
      actionSheet,
      issue.idReadable,
      issue.summary.length > 155 ? `${issue.summary.substr(0, 153)}…` : issue.summary
    );

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function onShowCopyTextContextActions(actionSheet: ActionSheet, text: string, title?: string): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const selectedAction = await showActions(
      [
        {
          title: title || 'Copy text',
          execute: () => {
            usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy text via action');
            Clipboard.setString(text);
            notify('Text copied');
          },
        },
        {title: 'Cancel'},
      ],
      actionSheet,
    );

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function openNestedIssueView(params: OpenNestedViewParams): (() => any | void) {
  return () => {
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Navigate to linked issue');
    if (!params.issue) {
      return Router.Issue({issueId: params.issueId});
    }

    Router.Issue({
      issuePlaceholder: {...params.issue, ...{fieldHash: ApiHelper.makeFieldHash(params.issue)}},
      issueId: params.issue?.id,
    });
  };
}

export function unloadIssueIfExist(): ((dispatch: (any) => any, getState: StateGetter) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    const state = getState().issueState;
    if (state !== initialState) {
      dispatch(unloadActiveIssueView());
    }
  };
}

export function openIssueListWithSearch(query: string): (() => void) {
  return () => {
    Router.Issues({query});
  };
}

export function onTagRemove(tagId: string): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issue = getState().issueState.issue;
    const api: Api = getApi();
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Remove tag');
    try {
      await api.issue.removeTag(issue.id, tagId);
      const updatedIssue: IssueFull = {...issue, tags: issue.tags.filter((tag: Tag) => tag.id !== tagId)};
      dispatch(receiveIssue(updatedIssue));
    } catch (err) {
      const errorMsg: string = 'Failed to remove tag';
      log.warn(errorMsg, err);
      notify(errorMsg, err);
    }
  };
}


export function getCommandSuggestions(command: string, caret: number): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issueId;
    await commandDialogHelper.loadIssueCommandSuggestions([issueId], command, caret).then(
      (suggestions: CommandSuggestionResponse) => {
        suggestions && dispatch(receiveCommandSuggestions(suggestions));
      }).catch(() => {
      //
    });
  };
}

export function applyCommand(command: string): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void> | Promise<any>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().issueState.issueId;

    dispatch(startApplyingCommand());
    await commandDialogHelper.applyCommand([issueId], command).then(async () => {
      dispatch(closeCommandDialog());
      if (command.toLowerCase().trim() === 'delete') {
        notify('Issue deleted');
        Router.Issues();
      } else {
        await dispatch(loadIssue());
        dispatch(issueUpdated(getState().issueState.issue));
      }
    }).finally(() => {
      dispatch(stopApplyingCommand());
    });
  };
}

export function updateUserAppearanceProfile(userAppearanceProfile: UserAppearanceProfile): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    dispatch(receiveUserAppearanceProfile(userAppearanceProfile));
  };
}

export function uploadIssueAttach(files: Array<NormalizedAttachment>): ((dispatch: (any) => any, getState: StateGetter) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    await dispatch(attachmentActions.uploadFile(files, getState().issueState.issueId));
  };
}

export function cancelAddAttach(attach: Attachment): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    await dispatch(attachmentActions.cancelImageAttaching(attach));
  };
}

export function loadAttachments(): ((dispatch: (any) => any, getState: StateGetter) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    dispatch(attachmentActions.loadIssueAttachments(getState().issueState.issueId));
  };
}

export function toggleVisibleAddAttachDialog(isVisible: boolean): ((dispatch: (any) => any) => Promise<void>) {
  return async (dispatch: (any) => any) => {
    dispatch(attachmentActions.toggleAttachFileDialog(isVisible));
  };
}

export function removeAttachment(attach: Attachment): ((dispatch: (any) => any, getState: StateGetter) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    await dispatch(attachmentActions.removeAttachment(attach, getState().issueState.issueId));
  };
}

export function updateIssueVisibility(visibility: Visibility): ((
  dispatch: (any) => any,
  getState: StateGetter,
  getApi: ApiGetter
) => Promise<void>) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueState: IssueFull = getState().issueState;
    const prevVisibility: Visibility = issueState.issue.visibility;
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update visibility');

    try {
      const issueWithUpdatedVisibility: Visibility = await getApi().issue.updateVisibility(issueState.issueId, visibility);
      dispatch(receiveIssueVisibility(issueWithUpdatedVisibility.visibility));

    } catch (err) {
      dispatch(receiveIssueVisibility(Object.assign({timestamp: Date.now()}, prevVisibility)));
      const message: string = 'Cannot update issue visibility';
      notify(message, err);
      log.warn(message, err);
    }
  };
}

export function onCloseTagsSelect(): ((dispatch: (any) => any) => void) {
  return (dispatch: (any) => any) => {

    dispatch({
      type: types.CLOSE_ISSUE_SELECT,
      selectProps: null,
      isTagsSelectVisible: false,
    });
  };
}

export function onOpenTagsSelect(): ((dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => void) {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issue: IssueFull = getState().issueState.issue;
    usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Open Tags select');

    dispatch({
      type: types.OPEN_ISSUE_SELECT,
      selectProps: {
        multi: true,
        placeholder: 'Filter tags',
        dataSource: async () => {
          const issueProjectId: string = issue.project.id;
          const [error, relevantProjectTags] = await until(api.issueFolder.getProjectRelevantTags(issueProjectId));
          if (error) {
            return [];
          }
          return relevantProjectTags;
        },

        selectedItems: issue?.tags || [],
        getTitle: item => getEntityPresentation(item),
        onCancel: () => dispatch(onCloseTagsSelect()),
        onSelect: async (tags: Array<Tag>) => {
          const [error, issueWithTags] = await until(api.issue.addTags(issue.id, tags));
          dispatch(receiveIssue({...issue, tags: issueWithTags?.tags || []}));
          dispatch(onCloseTagsSelect());
          if (error) {
            dispatch(receiveIssue(issue));
            notify('Failed to add a tag');
          }

        },
      },
      isTagsSelectVisible: true,
    });
  };
}
