import {
  attachmentActionMap,
  createAttachmentTypes,
} from 'components/attachments-row/attachment-helper';
import {getAttachmentActions} from 'components/attachments-row/attachment-actions';
import type {AttachmentActions} from 'components/attachments-row/attachment-actions';
export const modalIssueNamespace = 'modal';
export const attachmentTypes: typeof attachmentActionMap = createAttachmentTypes(
  modalIssueNamespace,
);
export const attachmentActions: AttachmentActions = getAttachmentActions(
  modalIssueNamespace,
);
