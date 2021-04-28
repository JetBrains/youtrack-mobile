/* @flow */

const ATTACH_RECEIVE_ALL_ATTACHMENTS = 'ATTACH_RECEIVE_ALL_ATTACHMENTS';
const ATTACH_REMOVE = 'ATTACH_REMOVE';
const ATTACH_START_ADDING = 'ATTACH_START_ADDING';
const ATTACH_CANCEL_ADDING = 'ATTACH_CANCEL_ADDING';
const ATTACH_STOP_ADDING = 'ATTACH_STOP_ADDING';
const ATTACH_TOGGLE_ADD_FILE_DIALOG = 'ATTACH_TOGGLE_ADD_FILE_DIALOG';

const attachment_ATTACH_RECEIVE_ALL_ATTACHMENTS = 'attachment.ATTACH_RECEIVE_ALL_ATTACHMENTS';
const attachment_ATTACH_REMOVE = 'attachment.ATTACH_REMOVE';
const attachment_ATTACH_START_ADDING = 'attachment.ATTACH_START_ADDING';
const attachment_ATTACH_CANCEL_ADDING = 'attachment.ATTACH_CANCEL_ADDING';
const attachment_ATTACH_STOP_ADDING = 'attachment.ATTACH_STOP_ADDING';
const attachment_ATTACH_TOGGLE_ADD_FILE_DIALOG = 'attachment.ATTACH_TOGGLE_ADD_FILE_DIALOG';

export const attachmentActionMap: {
  ATTACH_CANCEL_ADDING: string,
  ATTACH_RECEIVE_ALL_ATTACHMENTS: string,
  ATTACH_REMOVE: string,
  ATTACH_START_ADDING: string,
  ATTACH_STOP_ADDING: string,
  ATTACH_TOGGLE_ADD_FILE_DIALOG: string,
} = {
  [ATTACH_RECEIVE_ALL_ATTACHMENTS]: attachment_ATTACH_RECEIVE_ALL_ATTACHMENTS,
  [ATTACH_REMOVE]: attachment_ATTACH_REMOVE,
  [ATTACH_START_ADDING]: attachment_ATTACH_START_ADDING,
  [ATTACH_CANCEL_ADDING]: attachment_ATTACH_CANCEL_ADDING,
  [ATTACH_STOP_ADDING]: attachment_ATTACH_STOP_ADDING,
  [ATTACH_TOGGLE_ADD_FILE_DIALOG]: attachment_ATTACH_TOGGLE_ADD_FILE_DIALOG,
};


export const createAttachmentTypes = function (prefix: string): typeof attachmentActionMap {
  const attachmentTypes: Object = {};
  Object.entries(attachmentActionMap).forEach((entry: $TupleMap<any, any>) => {
    attachmentTypes[entry[0]] = `${prefix}.${entry[1]}`;
  });
  return attachmentTypes;
};
