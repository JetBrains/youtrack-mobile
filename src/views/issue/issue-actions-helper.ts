import type {CustomField, FieldValue, IssueProject} from 'types/CustomFields';
import type {
  CommandSuggestionResponse,
  IssueFull,
  IssueOnList,
} from 'types/Issue';
import type {Visibility} from 'types/Visibility';
import type {CustomError} from 'types/Error';
import type {IssueBaseActions} from './issue-base-reducer';
import {commandDialogActionMap} from 'components/command-dialog/command-dialog-action-types';
import type {AttachmentActions} from 'components/attachments-row/attachment-actions';
import {attachmentActionMap} from 'components/attachments-row/attachment-helper';
import {NormalizedAttachment} from 'types/Attachment';


export const createDispatchActions = (
  actions: IssueBaseActions,
  commandDialogTypes: typeof commandDialogActionMap,
  attachmentActions: AttachmentActions,
  attachmentTypes: Record<keyof typeof attachmentActionMap, string>,
) => ({
  setIssueId: (
    issueId: string,
  ): {
    issueId: string;
    type: any;
  } => {
    return actions.SET_ISSUE_ID({
      issueId,
    });
  },
  startIssueRefreshing: (): {
    type: any;
  } => {
    return actions.START_ISSUE_REFRESHING();
  },
  stopIssueRefreshing: (): {
    type: any;
  } => {
    return actions.START_ISSUE_REFRESHING();
  },
  receiveIssue: (
    issue: IssueFull,
  ): {
    issue: IssueFull;
    type: any;
  } => {
    return actions.RECEIVE_ISSUE({
      issue,
    });
  },
  setIssueFieldValue: (
    field: CustomField,
    value: FieldValue,
  ): {
    field: CustomField;
    type: any;
    value: FieldValue;
  } => {
    return actions.SET_ISSUE_FIELD_VALUE({
      field,
      value,
    });
  },
  setProject: (
    project: IssueProject,
  ): {
    project: IssueProject;
    type: any;
  } => {
    return actions.SET_PROJECT({
      project,
    });
  },
  startEditingIssue: (): {
    type: any;
  } => {
    return actions.START_EDITING_ISSUE();
  },
  stopEditingIssue: (): {
    type: any;
  } => {
    return actions.STOP_EDITING_ISSUE();
  },
  setIssueSummaryAndDescription: (
    summary: string,
    description: string,
  ): {
    description: string;
    summary: string;
    type: any;
  } => {
    return actions.SET_ISSUE_SUMMARY_AND_DESCRIPTION({
      summary,
      description,
    });
  },
  setIssueSummaryCopy: (
    summary: string,
  ): {
    summary: string;
    type: any;
  } => {
    return actions.SET_ISSUE_SUMMARY_COPY({
      summary,
    });
  },
  setIssueDescriptionCopy: (
    description: string,
  ): {
    description: string;
    type: any;
  } => {
    return actions.SET_ISSUE_DESCRIPTION_COPY({
      description,
    });
  },
  startSavingEditedIssue: (): {
    type: any;
  } => {
    return actions.START_SAVING_EDITED_ISSUE();
  },
  stopSavingEditedIssue: (): {
    type: any;
  } => {
    return actions.STOP_SAVING_EDITED_ISSUE();
  },
  setVoted: (
    voted: boolean,
  ): {
    type: any;
    voted: boolean;
  } => {
    return actions.SET_VOTED({
      voted,
    });
  },
  setStarred: (
    starred: boolean,
  ): {
    starred: boolean;
    type: any;
  } => {
    return actions.SET_STARRED({
      starred,
    });
  },
  issueUpdated: (
    issue: IssueFull,
  ): {
    issue: IssueFull;
    type: any;
  } => {
    return actions.RECEIVE_ISSUE({
      issue,
    });
  },
  unloadActiveIssueView: (): {
    type: any;
  } => {
    return actions.UNLOAD_ACTIVE_ISSUE_VIEW();
  },
  openTagsSelect: (selectProps: any) => {
    return actions.OPEN_ISSUE_SELECT({
      selectProps,
    });
  },
  closeTagsSelect: (): {
    selectProps: null;
    isTagsSelectVisible: boolean;
  } => {
    return actions.CLOSE_ISSUE_SELECT({
      selectProps: null,
    });
  },

  setError(error: CustomError) {
    return actions.RECEIVE_ISSUE_ERROR({
      error,
    });
  },

  openCommandDialog: (
    initialCommand: string = '',
  ): {
    initialCommand: string;
    type: any;
  } => {
    return {
      type: commandDialogTypes.OPEN_COMMAND_DIALOG,
      initialCommand,
    };
  },
  closeCommandDialog: (): {
    type: any;
  } => {
    return {
      type: commandDialogTypes.CLOSE_COMMAND_DIALOG,
    };
  },
  receiveCommandSuggestions: (
    suggestions: CommandSuggestionResponse,
  ): {
    suggestions: CommandSuggestionResponse;
    type: any;
  } => {
    return {
      type: commandDialogTypes.RECEIVE_COMMAND_SUGGESTIONS,
      suggestions,
    };
  },
  startApplyingCommand: (): {
    type: any;
  } => {
    return {
      type: commandDialogTypes.START_APPLYING_COMMAND,
    };
  },
  stopApplyingCommand: (): {
    type: any;
  } => {
    return {
      type: commandDialogTypes.STOP_APPLYING_COMMAND,
    };
  },
  receiveIssueVisibility: (
    visibility: Visibility,
  ): {
    type: any;
    visibility: Visibility;
  } => {
    return actions.RECEIVE_ISSUE_VISIBILITY({
      visibility,
    });
  },
  receiveAllAttachments: (
    attachments: Attachment[],
  ): {
    type: any;
    attachments: Attachment[];
  } => {
    return {
      type: attachmentTypes.ATTACH_RECEIVE_ALL_ATTACHMENTS,
      attachments,
    };
  },
  receiveIssueLinks: (links: IssueOnList[]) => {
    return actions.RECEIVE_ISSUE_LINKS({
      links,
    });
  },
  toggleAttachFileDialog: (isVisible: boolean) => {
    return attachmentActions.toggleAttachFileDialog(isVisible);
  },
  cancelImageAttaching: attach => {
    return attachmentActions.cancelImageAttaching(attach);
  },
  loadIssueAttachments: issueId => {
    return attachmentActions.loadIssueAttachments(issueId);
  },
  removeAttachment: (attach, issueId) => {
    return attachmentActions.removeAttachment(attach, issueId);
  },
  uploadFile: (files: NormalizedAttachment[], issue: IssueFull) => {
    return attachmentActions.doUploadFile(false, files, issue);
  },
});
