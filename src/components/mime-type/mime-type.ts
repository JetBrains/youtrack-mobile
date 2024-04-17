interface File {
  mimeType: string | null;
}

export const hasMimeType = function (mimeType: string) {
  return function (file: File): boolean {
    return mimeType && file && file.mimeType ? file.mimeType.includes(mimeType) : false;
  };
};
hasMimeType.svg = hasMimeType('image/svg+xml');

hasMimeType.image = (file: File) =>
  !hasMimeType.svg(file) && hasMimeType('image/')(file) && !hasMimeType('/targa')(file);

hasMimeType.pdf = hasMimeType('application/pdf');
hasMimeType.video = hasMimeType('video/');
hasMimeType.audio = hasMimeType('audio/');

hasMimeType.previewable = (file: File) => hasMimeType.image(file) || hasMimeType.svg(file);
