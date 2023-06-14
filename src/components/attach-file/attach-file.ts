import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import DocumentPicker, {DocumentPickerResponse} from 'react-native-document-picker';

import {guid} from 'util/util';

import type {NormalizedAttachment} from 'types/Attachment';


export enum attachFileMethod {
  openCamera = 'openCamera',
  openPicker = 'openPicker',
  document = 'document',
}

const FILE_NAME_REGEXP: RegExp = /(?=\w+\.\w{3,4}$).+/gi;

function extractFileNameFromPath(path: string): string | undefined {
  const [fileName]: (string | undefined)[] = path.match(FILE_NAME_REGEXP) || [];
  return fileName;
}

async function pickDocument(): Promise<NormalizedAttachment[]> {
  const files: DocumentPickerResponse[] = await DocumentPicker.pick({allowMultiSelection: true});

  return (files?.length >= 1 ? files : [files]).map((file: DocumentPickerResponse) => {
    return {
      url: file.uri,
      size: file.size,
      name: file.name,
      mimeType: file.type,
    };
  });
}

async function pickPhoto(method: keyof typeof attachFileMethod): Promise<NormalizedAttachment[]> {
  const files: ImageOrVideo[] = await ImagePicker[method as (attachFileMethod.openCamera | attachFileMethod.openPicker)]({
    forceJpg: true,
    mediaType: 'any',
    multiple: true,
  });
  return (files?.length >= 1 ? files : [files]).map((file: ImageOrVideo) => {
    return {
      url: file.path || '',
      name: (file.path ? extractFileNameFromPath(file.path || '') : file.filename) || `${guid()}`,
      mimeType: file.mime,
      dimensions: {
        width: file.width,
        height: file.height,
      },
      size: file.size,
    };
  });
}

export default async function attachFile(
  method: keyof typeof attachFileMethod = attachFileMethod.openPicker,
): Promise<Array<NormalizedAttachment> | null> {
  try {
    return method === attachFileMethod.document ? await pickDocument() : await pickPhoto(method);
  } catch (err) {
    if (err?.toString?.()?.includes('User cancelled image selection')) {
      return null;
    }
    throw err;
  }
}
