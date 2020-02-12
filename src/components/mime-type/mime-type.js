/* @flow */

export const hasMimeType = function(mimeType: string) {
  return function(file: Object) {
    return mimeType && file && file.mimeType ? file.mimeType.includes(mimeType) : false;
  };
};

hasMimeType.svg = hasMimeType('image/svg+xml');

hasMimeType.image = (file) => !hasMimeType.svg(file) && hasMimeType('image/')(file) && !hasMimeType('/targa')(file);

hasMimeType.pdf = hasMimeType('application/pdf');

hasMimeType.previewable = (file) => hasMimeType.image(file) || hasMimeType.svg(file);
