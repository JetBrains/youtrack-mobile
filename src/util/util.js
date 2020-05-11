/* @flow */

import React from 'react';
import {Platform} from 'react-native';

export const isReactElement = (element: any) => {
  return React.isValidElement(element);
};

export const isIOS = () => {
  return Platform.OS === 'ios';
};

export const isAndroid = () => {
  return Platform.OS === 'android';
};
