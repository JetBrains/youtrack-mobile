/* @flow */

import React from 'react';
import {Platform} from 'react-native';

export const isReactElement = (element: any) => {
  return React.isValidElement(element);
};

export const isIOSPlatform = () => {
  return Platform.OS === 'ios';
};

export const isAndroidPlatform = () => {
  return Platform.OS === 'android';
};
