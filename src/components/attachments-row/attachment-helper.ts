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
  Object.entries(attachmentActionMap).forEach(function(entry: $TupleMap<any, any>) {
    attachmentTypes[entry[0]] = `${prefix}.${entry[1]}`;
  });
  return attachmentTypes;
};

export type FileCategoryKey = 'default'| 'sheet'| 'sketch'| 'text'| 'video'| 'audio';

// Source https://github.com/dyne/file-extension-list/blob/master/pub/categories.json
export const attachmentCategories: { [FileCategoryKey]: string } = {
  default: '',
  sheet: 'ods xls xlsx csv ics vcf',
  sketch: 'ai eps ps svg dwg dxf gpx kml kmz webp',
  text: 'doc docx ebook log md msg odt org pages pdf rtf rst tex txt wpd wps',
  video: '3g2 3gp aaf asf avchd avi drc flv m2v m4p m4v mkv mng mov mp2 mp4 mpe mpeg mpg mpv mxf nsv ogg ogv ogm qt rm rmvb roq srt svi vob webm wmv yuv',
  audio: 'aac aiff ape au flac gsm it m3u m4a mid mod mp3 mpa pls ra s3m sid wav wma xm',
};
