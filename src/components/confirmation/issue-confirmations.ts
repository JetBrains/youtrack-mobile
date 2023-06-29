import {confirmation, deleteButtonText} from 'components/confirmation/confirmation';
import {i18n} from 'components/i18n/i18n';

export const confirmDeleteIssue = (issueId: string, message?: string): any =>
  confirmation(
    i18n('Delete issue {{issueId}}?', {issueId}),
    deleteButtonText,
    message,
  );
