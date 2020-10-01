/* @flow */

import React from 'react';

import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import {UNIT} from '../variables/variables';

type SkeletonProps = {
  width?: number,
  height?: number,
  borderRadius?: number
}

export const SKELETON_WIDTH: number = 100;
export const SKELETON_HEIGHT: number = 20;
export const SKELETON_SECONDARY_HEIGHT: number = 14;
export const SKELETON_DEFAULT_BORDER_RADIUS: number = UNIT / 2;

const cv: number = 200;
export const skeletonPlaceholderDefaultProps = {
  backgroundColor: `rgba(${cv},${cv},${cv},${0.2})`,
  highlightColor: `rgba(${cv},${cv},${cv},${0.1})`
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
    width={props.width || '100%'}
    height={SKELETON_SECONDARY_HEIGHT}
    {...props}
  />;
};

export const SkeletonLine = (props: SkeletonProps) => {
  return <SkeletonPlaceholder.Item
    {...defaultSkeletonProps}
    width={'100%'}
    height={SKELETON_HEIGHT}
    {...props}
  />;
};

function skeletonUserInfo() {
  return <SkeletonPlaceholder.Item flexGrow={1}>
    <SkeletonPlaceholder.Item
      width={140}
      height={SKELETON_HEIGHT}
      marginLeft={UNIT}
      borderRadius={SKELETON_DEFAULT_BORDER_RADIUS}
    />
  </SkeletonPlaceholder.Item>;
}

function skeletonDate() {
  return <SkeletonPlaceholder.Item
    width={80}
    height={SKELETON_SECONDARY_HEIGHT}
    borderRadius={SKELETON_DEFAULT_BORDER_RADIUS}
  />;
}

function skeletonActivityLine(width?: number) {
  return SkeletonSecondaryLine({
    width: width,
    marginLeft: UNIT * 6,
    marginTop: UNIT
  });
}

export const SkeletonIssueContent = () => {
  return <SkeletonPlaceholder
    {...skeletonPlaceholderDefaultProps}
  >

    {SkeletonLine({
      marginTop: UNIT * 3,
    })}

    {SkeletonSecondaryLine({
      marginTop: UNIT * 3,
    })}

    {SkeletonSecondaryLine({
      width: 300,
      marginTop: UNIT,
    })}

    {SkeletonSecondaryLine({
      width: 180,
      marginTop: UNIT,
    })}

    {SkeletonSecondaryLine({
      width: 220,
      marginTop: UNIT,
    })}

  </SkeletonPlaceholder>;
};
export const SkeletonIssueCustomFields = () => {
  const props = {
    width: 90,
    height: 36,
    borderRadius: SKELETON_DEFAULT_BORDER_RADIUS,
    marginTop: UNIT / 2,
    marginLeft: UNIT,
    marginRight: UNIT
  };
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item
        flexDirection='row'
        justifyContent='space-between'
        marginTop={UNIT * 3}
      >
        {Array(4).fill(0).map((it: number, index: number) => <SkeletonPlaceholder.Item
          key={`skeletonCustomField-${index}`} {...props}/>)}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
export const SkeletonIssueInfoLine = (props: { lines?: number }) => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item
        flexDirection='column'
      >
        {Array(props.lines || 1).fill(0).map((it: number, index: number) =>
          SkeletonSecondaryLine({
            key: `issueAddInfo-${index}`,
            width: 200,
            marginTop: UNIT
          }))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

function skeletonAvatar() {
  return <SkeletonPlaceholder.Item
    width={32}
    height={32}
    borderRadius={3}
  />;
}

function skeletonIssueActivity(marginTop: number = 0, key: string) {
  return (
    <SkeletonPlaceholder.Item
      key={key}
      marginTop={marginTop}
      marginRight={UNIT}
    >
      <SkeletonPlaceholder.Item
        flexDirection='row'
        alignItems='center'
        justifyContent='space-between'
        marginTop={UNIT}
        marginLeft={UNIT}
      >
        {skeletonAvatar()}
        {skeletonUserInfo()}
        {skeletonDate()}

      </SkeletonPlaceholder.Item>

      {skeletonActivityLine()}
      {skeletonActivityLine(120)}

    </SkeletonPlaceholder.Item>
  );
}

export const SkeletonIssueActivities = (props?: SkeletonProps) => {
  return <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
    <SkeletonPlaceholder.Item {...props}>
      {
        [0, UNIT * 2, UNIT * 3].map(
          ((marginTop: number, index: number) => skeletonIssueActivity(marginTop, `activity-${index}`))
        )
      }
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>;
};


function skeletonIssue(key: string) {
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

export const SkeletonIssues = (props: SkeletonProps) => {
  return <SkeletonPlaceholder
    {...skeletonPlaceholderDefaultProps}
    {...props}
  >
    <SkeletonPlaceholder.Item
      fleDirection='column'
      marginLeft={UNIT * 2}
      marginRight={UNIT * 2}
    >
      {
        Array(5).fill(0)
          .map(((marginTop: number, index) => skeletonIssue(`skeletonIssues-${index}`)))
      }
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>;
};
