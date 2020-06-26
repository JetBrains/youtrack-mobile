/* @flow */

import {createAttachmentTypes} from '../../components/attachments-row/attachment-types';
import {getAttachmentActions} from '../../components/attachments-row/attachment-actions';

import type {AttachmentTypes} from '../../components/attachments-row/attachment-types';

const PREFIX: string = 'singleIssue';

export const attachmentTypes: AttachmentTypes = createAttachmentTypes(PREFIX);
export const attachmentActions = getAttachmentActions(PREFIX);
