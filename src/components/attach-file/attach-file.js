/* @flow */
import ImagePicker from 'react-native-image-crop-picker';

const FILE_NAME_REGEXP = /(?=\w+\.\w{3,4}$).+/ig;

type Attachment = {
  filename?: string,
  path: string,
  mime: string
}

type NormalizedAttachment = {
  url: string,
  name: string,
  mimeType: string
}

function extractFileNameFromPath(path: string): string {
  const [fileName] = path.match(FILE_NAME_REGEXP) || [];
  return fileName;
}

async function pickPhoto(method: string): Promise<NormalizedAttachment> {
  const image: Attachment = await ImagePicker[method]({
    mediaType: 'photo',
    cropping: true,
    freeStyleCropEnabled: true,
    avoidEmptySpaceAroundImage: false
  });

  const filePath = image.path || '';
  const fileName = image.filename || extractFileNameFromPath(filePath);

  return {
    url: filePath,
    name: fileName,
    mimeType: image.mime
  };
}

export default async function attachFile(method: 'openCamera'|'openPicker' = 'openPicker'): Promise<?NormalizedAttachment> {
  try {
    return await pickPhoto(method);
  } catch (err) {
    if (err.toString().includes('User cancelled image selection')) {
      return null;
    }
    throw err;
  }
}
