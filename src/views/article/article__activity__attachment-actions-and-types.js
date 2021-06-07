/* @flow */

import {createAttachmentTypes} from '../../components/attachments-row/attachment-types';
import {getAttachmentActions} from '../../components/attachments-row/attachment-actions';

const PREFIX: string = 'articleActivity';

export const attachmentTypes = createAttachmentTypes(PREFIX);
export const attachmentActions = getAttachmentActions(PREFIX);

