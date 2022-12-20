import ImagePicker from 'react-native-image-crop-picker';
import type {Attachment, NormalizedAttachment} from 'types/Attachment';
export const attachFileMethod: Record<string, string> = {
  openCamera: 'openCamera',
  openPicker: 'openPicker',
};
const FILE_NAME_REGEXP: RegExp = /(?=\w+\.\w{3,4}$).+/gi;

function extractFileNameFromPath(path: string): string {
  const [fileName] = path.match(FILE_NAME_REGEXP) || [];
  return fileName;
}

async function pickPhoto(
  method: keyof typeof attachFileMethod,
): Promise<Array<NormalizedAttachment>> {
  const files: Array<Attachment> = await ImagePicker[method]({
    forceJpg: true,
    mediaType: 'any',
    multiple: true,
  });
  return (files?.length >= 1 ? files : [(files as any) as Attachment]).map(
    (file: Attachment) => {
      return {
        url: file.path || '',
        name: file.path
          ? extractFileNameFromPath(file.path || '')
          : file.filename,
        mimeType: file.mime,
        dimensions: {
          width: file.width,
          height: file.height,
        },
      };
    },
  );
}

export default async function attachFile(
  method: keyof typeof attachFileMethod = attachFileMethod.openPicker,
): Promise<Array<NormalizedAttachment> | null> {
  try {
    return await pickPhoto(method);
  } catch (err) {
    if (err.toString().includes('User cancelled image selection')) {
      return null;
    }

    throw err;
  }
}
