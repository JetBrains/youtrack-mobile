/* @flow */

import {attachmentActionMap, createAttachmentTypes} from 'components/attachments-row/attachment-helper';
import {getAttachmentActions} from 'components/attachments-row/attachment-actions';
import {singleIssueNamespace} from './issue.modal-reducers';

import type {AttachmentActions} from 'components/attachments-row/attachment-actions';

export const attachmentTypes: typeof attachmentActionMap = createAttachmentTypes(singleIssueNamespace);
export const attachmentActions: AttachmentActions = getAttachmentActions(singleIssueNamespace);
