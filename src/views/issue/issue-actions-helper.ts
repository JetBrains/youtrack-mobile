import {attachmentActionMap} from 'components/attachments-row/attachment-helper';
import {commandDialogActionMap} from 'components/command-dialog/command-dialog-action-types';

import type {AttachmentActions} from 'components/attachments-row/attachment-actions';
import type {CommandSuggestionResponse, IssueFull, IssueSprint} from 'types/Issue';
import type {CustomError} from 'types/Error';
import type {CustomField, FieldValue, IssueLink} from 'types/CustomFields';
import type {IItem, ISelectProps} from 'components/select/select';
import type {IssueBaseActions} from './issue-base-reducer';
import type {Attachment, NormalizedAttachment} from 'types/Attachment';
import type {Project} from 'types/Project';
import type {UserCC} from 'types/User';
import type {Visibility} from 'types/Visibility';


export const createDispatchActions = (
  actions: IssueBaseActions,
  commandDialogTypes: typeof commandDialogActionMap,
  attachmentActions: AttachmentActions,
  attachmentTypes: Record<keyof typeof attachmentActionMap, string>
) => ({
  setIssueId: (issueId: string) => actions.SET_ISSUE_ID({issueId}),

  startIssueRefreshing: () => actions.START_ISSUE_REFRESHING(),

  stopIssueRefreshing: () => actions.START_ISSUE_REFRESHING(),

  receiveIssue: (issue: IssueFull) => actions.RECEIVE_ISSUE({issue}),

  setIssueFieldValue: (field: CustomField, value: FieldValue) => actions.SET_ISSUE_FIELD_VALUE({field, value}),

  setProject: (project: Project) => actions.SET_PROJECT({project}),

  startEditingIssue: () => actions.START_EDITING_ISSUE(),

  stopEditingIssue: () => actions.STOP_EDITING_ISSUE(),

  setIssueSummaryAndDescription: (summary: string, description: string) =>
    actions.SET_ISSUE_SUMMARY_AND_DESCRIPTION({summary, description}),

  setIssueSummaryCopy: (summary: string) => actions.SET_ISSUE_SUMMARY_COPY({summary}),

  setIssueDescriptionCopy: (description: string) => actions.SET_ISSUE_DESCRIPTION_COPY({description}),

  startSavingEditedIssue: () => actions.START_SAVING_EDITED_ISSUE(),

  stopSavingEditedIssue: () => actions.STOP_SAVING_EDITED_ISSUE(),

  setVoted: (voted: boolean) => actions.SET_VOTED({voted}),

  setStarred: (starred: boolean) => actions.SET_STARRED({starred}),

  issueUpdated: (issue: IssueFull) => actions.RECEIVE_ISSUE({issue}),

  unloadActiveIssueView: () => actions.UNLOAD_ACTIVE_ISSUE_VIEW(),

  openTagsSelect: (selectProps: ISelectProps<IItem>) => actions.OPEN_ISSUE_SELECT({selectProps}),

  closeTagsSelect: () => actions.CLOSE_ISSUE_SELECT({selectProps: null}),

  setError: (error: CustomError) => actions.RECEIVE_ISSUE_ERROR({error}),

  openCommandDialog: (initialCommand: string = '') => ({
    type: commandDialogTypes.OPEN_COMMAND_DIALOG,
    initialCommand,
  }),

  closeCommandDialog: () => ({type: commandDialogTypes.CLOSE_COMMAND_DIALOG}),

  receiveCommandSuggestions: (suggestions: CommandSuggestionResponse) => ({
    type: commandDialogTypes.RECEIVE_COMMAND_SUGGESTIONS,
    suggestions,
  }),

  startApplyingCommand: () => ({type: commandDialogTypes.START_APPLYING_COMMAND}),

  stopApplyingCommand: () => ({type: commandDialogTypes.STOP_APPLYING_COMMAND}),

  receiveIssueVisibility: (visibility: Visibility) => actions.RECEIVE_ISSUE_VISIBILITY({visibility}),

  receiveAllAttachments: (attachments: Attachment[]) => ({
    type: attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS,
    attachments,
  }),

  receiveIssueLinks: (links: IssueLink[]) => actions.RECEIVE_ISSUE_LINKS({links}),

  toggleAttachFileDialog: (isVisible: boolean) => attachmentActions.toggleAttachFileDialog(isVisible),

  cancelImageAttaching: (attach: Attachment) => attachmentActions.cancelImageAttaching(attach),

  loadIssueAttachments: (issueId: string) => attachmentActions.loadIssueAttachments(issueId),

  removeAttachment: (attach: Attachment, issueId: string) => attachmentActions.removeAttachment(attach, issueId),

  uploadFile: (files: NormalizedAttachment[], issue: IssueFull) => attachmentActions.doUploadFile(false, files, issue),

  setUserCC: (users: UserCC[]) => actions.SET_USERS_CC(users),

  setIssueSprints: (sprints: IssueSprint[]) => actions.SET_ISSUE_SPRINTS(sprints),
});
