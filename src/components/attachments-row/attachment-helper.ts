export enum attachmentActionMap {
  ATTACH_RECEIVE_ALL_ATTACHMENTS = 'attachment.ATTACH_RECEIVE_ALL_ATTACHMENTS',
  ATTACH_REMOVE = 'attachment.ATTACH_REMOVE',
  ATTACH_START_ADDING = 'attachment.ATTACH_START_ADDING',
  ATTACH_CANCEL_ADDING = 'attachment.ATTACH_CANCEL_ADDING',
  ATTACH_STOP_ADDING = 'attachment.ATTACH_STOP_ADDING',
  ATTACH_TOGGLE_ADD_FILE_DIALOG = 'attachment.ATTACH_TOGGLE_ADD_FILE_DIALOG',
}

export const createAttachmentTypes = function (prefix: string): Record<string, string> {
  const attachmentTypes: Record<string, string> = {};
  Object.entries(attachmentActionMap).forEach(function (entry: [string, string]) {
    attachmentTypes[entry[0]] = `${prefix}.${entry[1]}`;
  });
  return attachmentTypes;
};

export type FileCategoryKey =
  | 'default'
  | 'sheet'
  | 'sketch'
  | 'text'
  | 'video'
  | 'audio';
// Source https://github.com/dyne/file-extension-list/blob/master/pub/categories.json
export const attachmentCategories: Record<FileCategoryKey, string> = {
  default: '',
  sheet: 'ods xls xlsx csv ics vcf',
  sketch: 'ai eps ps svg dwg dxf gpx kml kmz webp',
  text: 'doc docx ebook log md msg odt org pages pdf rtf rst tex txt wpd wps',
  video: '3g2 3gp aaf asf avchd avi drc flv m2v m4p m4v mkv mng mov mp2 mp4 mpe mpeg mpg mpv mxf nsv ogg ogv ogm qt rm rmvb roq srt svi vob webm wmv yuv',
  audio: 'aac aiff ape au flac gsm it m3u m4a mid mod mp3 mpa pls ra s3m sid wav wma xm',
};
