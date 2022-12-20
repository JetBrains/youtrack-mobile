import {commandDialogActionMap} from 'components/command-dialog/command-dialog-action-types';
import {createCommandDialogTypeMap} from 'components/command-dialog/command-dialog-reducer';
export const createIssueNamespace: string = 'IssueCreate';
export const commandDialogTypes: typeof commandDialogActionMap = createCommandDialogTypeMap(
  createIssueNamespace,
);
export const ISSUE_CREATED: string = 'creation.ISSUE_CREATED';