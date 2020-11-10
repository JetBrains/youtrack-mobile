/* @flow */

import React from 'react';

import {Platform} from 'react-native';

import base64 from 'base64-js';
import qs from 'qs';

import appPackage from '../../package.json'; // eslint-disable-line import/extensions
import {getStorageState} from '../components/storage/storage';

import type {CustomError} from '../flow/Error';
import type {StorageState} from '../components/storage/storage';


export const AppVersion = appPackage.version.split('-')[0];

export const isReactElement = (element: any) => {
  return React.isValidElement(element);
};

export const isIOSPlatform = () => {
  return Platform.OS === 'ios';
};

export const isAndroidPlatform = () => {
  return Platform.OS === 'android';
};

export const getHUBUrl = (): string => {
  const storageState: StorageState = getStorageState();
  return storageState?.config?.auth?.serverUri || '';
};

export const parseUrlQueryString = (url: string): Object => {
  const match = url.match(/\?(.*)/);
  const query_string = match && match[1];
  return qs.parse(query_string);
};

export const detectLanguage = (code: string) => {
  let language;

  switch (true) {
  case(code.indexOf('java.') !== -1):
    language = 'java';
    break;
  case(code.indexOf('kotlin.') !== -1):
    language = 'kotlin';
    break;
  default:
    language = '';
  }

  return language;
};

export const uuid = () => {
  let d = new Date().getTime();
  let d2 = 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

export const guid = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const removeTrailingSlash = (str: string): string => {
  return str.replace(/\/$/, '');
};

export const createBtoa = (str: string) => {
  const byteArray = [];
  for (let i = 0; i < str.length; i++) {
    byteArray.push(str.charCodeAt(i));
  }
  return base64.fromByteArray(byteArray);
};

export const until = (promises: any): Promise<[?CustomError, any]> => {
  if (!promises) {
    return Promise.reject(['No promises are provided']);
  }

  if (Array.isArray(promises)) {
    return Promise.all(promises)
      .then((data) => {
        return [null, data];
      })
      .catch((err: CustomError) => {
        return [err, promises.map<typeof undefined>(() => undefined)];
      });
  }

  return promises
    .then((data: any) => {
      return [null, data];
    })
    .catch((err: CustomError) => {
      return [err];
    });
};
