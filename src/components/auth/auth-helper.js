/* @flow */

import qs from 'qs';

export const parseQueryString = (url: string): Object => {
  const match = url.match(/\?(.*)/);
  const query_string = match && match[1];
  return qs.parse(query_string);
};
