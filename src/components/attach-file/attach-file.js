/* @flow */

import ImagePicker from 'react-native-image-crop-picker';

import type {NormalizedAttachment} from '../../flow/Attachment';

const FILE_NAME_REGEXP: RegExp = /(?=\w+\.\w{3,4}$).+/ig;

function extractFileNameFromPath(path: string): string {
  const [fileName] = path.match(FILE_NAME_REGEXP) || [];
  return fileName;
}

async function pickPhoto(method: string): Promise<Array<NormalizedAttachment>> {
  const files: Array<NormalizedAttachment> = await ImagePicker[method]({
    mediaType: 'any',
    multiple: true,
  });

  return files.map((file: NormalizedAttachment) => {
    return {
      url: file.path || '',
      name: file.filename || extractFileNameFromPath(file.path || ''),
      mimeType: file.mime,
      dimensions: {
        width: file.width,
        height: file.height,
      },
    };
  });
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
