/* @flow */

import {createAttachmentTypes, attachmentActionMap} from 'components/attachments-row/attachment-helper';
import {getAttachmentActions} from 'components/attachments-row/attachment-actions';

import type {AttachmentActions} from 'components/attachments-row/attachment-actions';

const PREFIX: string = 'createIssue';

export const attachmentTypes: typeof attachmentActionMap = createAttachmentTypes(PREFIX);
export const attachmentActions: AttachmentActions = getAttachmentActions(PREFIX);
