export const textPattern = /(.|\s)*\S(.|\s)*/i;

const emailPattern =
  /([a-z\u0400-\u04FF0-9!#$%&'*+\\/=?^_`{|}~.-]+)@[a-z\u0400-\u04FF0-9]([a-z\u0400-\u04FF0-9-]*[a-z\u0400-\u04FF0-9])?(\.[a-z\u0400-\u04FF0-9]([a-z\u0400-\u04FF0-9-]*[a-z\u0400-\u04FF0-9])?)*/i;
export const emailRegexp = new RegExp(`^${emailPattern.source}$`, 'i');
