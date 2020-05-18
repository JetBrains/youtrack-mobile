/* @flow */

import React from 'react';
import {Platform} from 'react-native';
import {getStorageState} from '../components/storage/storage';
import type {StorageState} from '../components/storage/storage';

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
