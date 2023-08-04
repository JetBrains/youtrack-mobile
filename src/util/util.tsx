import React from 'react';
import {Platform} from 'react-native';
import base64 from 'base64-js';
import DeviceInfo from 'react-native-device-info';
import qs from 'qs';
import appPackage from '../../package.json';
import {getStorageState} from 'components/storage/storage';
import type {CustomError} from 'types/Error';
import type {StorageState} from 'components/storage/storage';

type RequestPromise = { status: 'fulfilled' | 'rejected', value: any[] };


export const AppVersion: any = appPackage.version.split('-')[0];
export const isTablet: boolean = DeviceInfo.isTablet();
export const isReactElement = (element: any): boolean => {
  return React.isValidElement(element);
};
export const isIOSPlatform = (): boolean => {
  return Platform.OS === 'ios';
};
export const isAndroidPlatform = (): boolean => {
  return Platform.OS === 'android';
};
export const getHUBUrl = (): string => {
  const storageState: StorageState = getStorageState();
  return storageState?.config?.auth?.serverUri || '';
};
export const parseUrlQueryString = (url: string): Record<string, any> => {
  const match = url.match(/\?(.*)/);
  const query_string = match && match[1];
  return qs.parse(query_string);
};
export const uuid = (): string => {
  let d = new Date().getTime();
  let d2 = 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16

    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }

    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};
export const guid = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
export const removeTrailingSlash = (str: string): string => {
  return str.replace(/\/$/, '');
};
export const createBtoa = (str: string): any => {
  const byteArray = [];

  for (let i = 0; i < str.length; i++) {
    byteArray.push(str.charCodeAt(i));
  }

  return base64.fromByteArray(byteArray);
};

export const until = (
  promises: any,
  combine: boolean = false,
  anyPromiseSuccess: boolean = false,
): Promise<any[] | [CustomError, any[]]> => {
  if (!promises) {
    return Promise.reject(['No promises are provided']);
  }

  if (Array.isArray(promises)) {
    const resolveMethod = anyPromiseSuccess ? Promise.allSettled : Promise.all;
    return resolveMethod(promises)
      .then((data: any[]) => {
        const fulfilled: RequestPromise[] = anyPromiseSuccess ? data.filter((it) => it.status === 'fulfilled') : data;
        if (!fulfilled.length) {
          throw 'No fulfilled promises';
        }
        return [
          null,
          (
            combine
              ? fulfilled.reduce((list: any[], it: any) => list.concat(anyPromiseSuccess ? it.value : it), [])
              : anyPromiseSuccess ? fulfilled.map((it: RequestPromise) => it.value) : fulfilled
          ),
        ];
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
export const nullProjectCustomFieldMaxLength: number = 20;
export const createNullProjectCustomField = (
  projectName: string = '',
  label: string,
  maxLength: number = nullProjectCustomFieldMaxLength,
): {
  projectCustomField: {
    field: {
      name: string;
    };
  };
  value: {
    name: string;
  };
} => {
  const visibleProjectName: string =
    projectName.length > maxLength
      ? `${projectName.substring(0, maxLength - 3)}…`
      : projectName;
  return {
    projectCustomField: {
      field: {
        name: label,
      },
    },
    value: {
      name: visibleProjectName,
    },
  };
};
export const isURLPattern: (str: string) => boolean = (str: string): boolean =>
  /^(http(s?)):\/\/|(www.)/i.test(str);

export const removeDuplicatesFromArray = (A: any[]): any[] => {
  const idsMap: Record<string, boolean> = {};
  return A.filter(it => {
    return idsMap[it.id] ? false : (idsMap[it.id] = true);
  });
};

export const arrayToMap = (
  items: any[],
  keyName: string | null,
  lowerCaseKey: boolean = false,
): Record<string, any> => {
  const key: string = keyName != null ? keyName : 'id';
  return items.reduce(
    (map, item) => ({...map, [lowerCaseKey ? item[key].toLowerCase() : item[key]]: item}),
    {}
  );
};

export const mapToArray = (map: Record<string, any>): any[] => Object.keys(map).map(function (id) {
  return map[id];
});
