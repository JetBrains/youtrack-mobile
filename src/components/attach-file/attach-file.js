/* @flow */

import ImagePicker from 'react-native-image-crop-picker';

import type {Attachment, NormalizedAttachment} from '../../flow/Attachment';

const FILE_NAME_REGEXP: RegExp = /(?=\w+\.\w{3,4}$).+/ig;

function extractFileNameFromPath(path: string): string {
  const [fileName] = path.match(FILE_NAME_REGEXP) || [];
  return fileName;
}

async function pickPhoto(method: string): Promise<NormalizedAttachment> {
  const image: Attachment = await ImagePicker[method]({
    mediaType: 'any',
  });

  const filePath: string = image.path || '';
  const fileName: string = image.filename || extractFileNameFromPath(filePath);

  return {
    url: filePath,
    name: fileName,
    mimeType: image.mime,
    dimensions: {
      width: image.width,
      height: image.height,
    },
  };
}

export default async function attachFile(method: 'openCamera' | 'openPicker' = 'openPicker'): Promise<?NormalizedAttachment> {
  try {
    return await pickPhoto(method);
  } catch (err) {
    if (err.toString().includes('User cancelled image selection')) {
      return null;
    }
    throw err;
  }
}
