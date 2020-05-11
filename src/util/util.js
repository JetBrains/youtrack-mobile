/* @flow */

import React from 'react';

export const isReactElement = (element: any) => {
  return React.isValidElement(element);
};
