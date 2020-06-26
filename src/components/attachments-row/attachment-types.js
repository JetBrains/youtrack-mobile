/* @flow */

type AttachmentKey = 'ATTACH_REMOVE' | 'ATTACH_START_ADDING' | 'ATTACH_STOP_ADDING' | 'ATTACH_TOGGLE_ADD_FILE_DIALOG' | 'ATTACH_RECEIVE_ALL_ATTACHMENTS';
type AttachmentValue = 'attachment.ATTACH_REMOVE' | 'attachment.ATTACH_START_ADDING' | 'attachment.ATTACH_STOP_ADDING' | 'attachment.ATTACH_TOGGLE_ADD_FILE_DIALOG' | 'attachment.ATTACH_RECEIVE_ALL_ATTACHMENTS';

const types: {key: AttachmentKey, value: AttachmentValue} = {
  ATTACH_REMOVE: 'attachment.ATTACH_REMOVE',
  ATTACH_START_ADDING: 'attachment.ATTACH_START_ADDING',
  ATTACH_STOP_ADDING: 'attachment.ATTACH_STOP_ADDING',
  ATTACH_TOGGLE_ADD_FILE_DIALOG: 'attachment.ATTACH_TOGGLE_ADD_FILE_DIALOG',
  ATTACH_RECEIVE_ALL_ATTACHMENTS: 'attachment.ATTACH_RECEIVE_ALL_ATTACHMENTS'
};

export type AttachmentTypes = $Keys<typeof types>;

export const createAttachmentTypes = function (prefix: string): {key: AttachmentKey, value: AttachmentValue} {
  const attachmentTypes: AttachmentTypes = {};
  Object.entries(types).forEach((entry: Array<AttachmentKey | AttachmentValue>) => {
    attachmentTypes[entry[0]] = `${prefix}.${entry[1]}`;
  });
  return attachmentTypes;
};
