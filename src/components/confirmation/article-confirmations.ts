import {confirmation, deleteButtonText} from 'components/confirmation/confirmation';
import {i18n} from 'components/i18n/i18n';

export const confirmDeleteArticle = (message?: string): any =>
  confirmation(
    i18n('Are you sure you want to delete this article?'),
    deleteButtonText,
    message,
  );
export const confirmDeleteArticleDraft = (message?: string): any =>
  confirmation(
    i18n('Are you sure you want to delete this draft?'),
    deleteButtonText,
    message,
  );
export const confirmDeleteAllDrafts = (): any =>
  confirmation(
    i18n('Are you sure you want to delete all article drafts?'),
    deleteButtonText,
    i18n('This action deletes all drafts, including unpublished sub-articles'),
  );
