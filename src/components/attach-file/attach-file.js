/* @flow */
import ImagePicker from 'react-native-image-picker';

const FILE_NAME_REGEXP = /(?=\w+\.\w{3,4}$).+/ig;

const options = {
  takePhotoButtonTitle: 'Take photo',
  chooseFromLibraryButtonTitle: 'Choose from library'
};

type Attachment = {
  data: string,
  uri: string,
  path: ?string,
  isVertical: boolean,
  error: Object
}

export default async function attachPhoto(method: string = 'showImagePicker') {
  return new Promise((resolve, reject) => {
    ImagePicker[method](options, (res: Attachment) => {
      if (res.didCancel) {
        return;
      }
      if (res.error) {
        return reject(res.error);
      }

      const filePath = res.path || res.uri || '';
      const fileName = filePath.match(FILE_NAME_REGEXP)[0];
      const fileUri = res.uri;

      const normalizedAttach = {
        url: fileUri,
        name: fileName,
        mimeType: 'image'
      };

      resolve(normalizedAttach);
    });
  });
}
