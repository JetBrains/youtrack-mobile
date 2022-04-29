/* @flow */

import ImagePicker from 'react-native-image-crop-picker';

import type {Attachment, NormalizedAttachment} from 'flow/Attachment';

export const attachFileMethod: { [string]: string } = {
  openCamera: 'openCamera',
  openPicker: 'openPicker',
};

const FILE_NAME_REGEXP: RegExp = /(?=\w+\.\w{3,4}$).+/ig;

function extractFileNameFromPath(path: string): string {
  const [fileName] = path.match(FILE_NAME_REGEXP) || [];
  return fileName;
}

async function pickPhoto(method: $Keys<typeof attachFileMethod>): Promise<Array<NormalizedAttachment>> {
  const files: Array<Attachment> = await ImagePicker[method]({
    forceJpg:true,
    mediaType: 'any',
    multiple: true,
  });

  return (files?.length >= 1 ? files : [((files: any): Attachment)]).map((file: Attachment) => {
    return {
      url: file.path || '',
      name: file.path ? extractFileNameFromPath(file.path || '') : file.filename,
      mimeType: file.mime,
      dimensions: {
        width: file.width,
        height: file.height,
      },
    };
  });
}

export default async function attachFile(method: $Keys<typeof attachFileMethod> = attachFileMethod.openPicker): Promise<Array<NormalizedAttachment> | null> {
  try {
    return await pickPhoto(method);
  } catch (err) {
    if (err.toString().includes('User cancelled image selection')) {
      return null;
    }
    throw err;
  }
}
