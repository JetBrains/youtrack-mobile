import {
  attachmentActionMap,
  createAttachmentTypes,
} from 'components/attachments-row/attachment-helper';
import {getAttachmentActions} from 'components/attachments-row/attachment-actions';
import type {AttachmentActions} from 'components/attachments-row/attachment-actions';
const PREFIX: string = 'articleActivity';
export const attachmentTypes: Record<keyof typeof attachmentActionMap, string> = createAttachmentTypes(
  PREFIX,
);
export const attachmentActions: AttachmentActions = getAttachmentActions(
  PREFIX,
);
