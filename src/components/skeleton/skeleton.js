/* @flow */

import React from 'react';

import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import {UNIT} from '../variables/variables';

type SkeletonProps = {
  width: number,
  height?: number,
  borderRadius?: number
}

export const SKELETON_WIDTH: number = 100;
export const SKELETON_HEIGHT: number = 20;
export const SKELETON_SECONDARY_HEIGHT: number = 14;
export const SKELETON_DEFAULT_BORDER_RADIUS: number = UNIT / 2;

export const skeletonPlaceholderDefaultProps = {
  backgroundColor: 'rgba(0,0,0,0.02)',
  highlightColor: 'rgba(0,0,0,0.04)'
};

const defaultSkeletonProps: SkeletonProps = {
  width: SKELETON_WIDTH,
  height: SKELETON_HEIGHT,
  borderRadius: SKELETON_DEFAULT_BORDER_RADIUS
};

export const Skeleton = (props: SkeletonProps) => {
  return <SkeletonPlaceholder
    {...skeletonPlaceholderDefaultProps}
  >
    <SkeletonPlaceholder.Item
      {...defaultSkeletonProps}
      {...props}
    />
  </SkeletonPlaceholder>;
};

export const SkeletonSecondaryLine = (props: SkeletonProps) => {
  return <SkeletonPlaceholder.Item
    {...defaultSkeletonProps}
    width={'100%'}
    height={SKELETON_SECONDARY_HEIGHT}
    {...props}
  />;
};

export const SkeletonLine = (props: SkeletonProps) => {
  return <SkeletonPlaceholder.Item
    {...defaultSkeletonProps}
    width={'100%'}
    height={SKELETON_SECONDARY_HEIGHT}
    {...props}
  />;
};

