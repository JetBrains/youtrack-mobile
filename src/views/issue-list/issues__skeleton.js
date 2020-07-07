import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import {UNIT} from '../../components/variables/variables';
import {
  SkeletonLine,
  SkeletonSecondaryLine,
  SKELETON_HEIGHT,
  skeletonPlaceholderDefaultProps,
} from '../../components/skeleton/skeleton';


export function skeletonIssue(key: string) {
  return (
    <SkeletonPlaceholder.Item
      key={key}
      marginBottom={UNIT * 2}
    >
      {SkeletonLine({
        width: 80,
        marginTop: UNIT,
        borderRadius: 10,
        height: SKELETON_HEIGHT
      })}
      {SkeletonSecondaryLine({
        marginTop: UNIT,
        borderRadius: 10,
      })}
      {SkeletonSecondaryLine({
        marginTop: UNIT,
        borderRadius: 10,
      })}
      {SkeletonLine({
        width: 160,
        marginTop: UNIT,
        borderRadius: 10,
        height: SKELETON_HEIGHT
      })}
    </SkeletonPlaceholder.Item>
  );
}


export const SkeletonIssues = () => {
  return <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
    <SkeletonPlaceholder.Item
      fleDirection='column'
      marginLeft={UNIT * 2}
      marginRight={UNIT * 2}
    >
      {
        Array(4).fill(0)
          .map(((marginTop: number, index) => skeletonIssue(`skeletonIssues-${index}`)))
      }
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>;
};
