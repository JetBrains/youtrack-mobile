import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import {UNIT} from '../../components/variables/variables';
import {
  DEFAULT_BORDER_RADIUS,
  HEIGHT,
  skeletonPlaceholderDefaultProps,
  SECONDARY_HEIGHT,
  SkeletonSecondaryLine
} from '../../components/skeleton/skeleton';

function skeletonUserInfo() {
  return <SkeletonPlaceholder.Item flexGrow={1}>
    <SkeletonPlaceholder.Item
      width={140}
      height={HEIGHT}
      marginLeft={UNIT}
      borderRadius={DEFAULT_BORDER_RADIUS}
    />
  </SkeletonPlaceholder.Item>;
}

function skeletonDate() {
  return <SkeletonPlaceholder.Item
    width={80}
    height={SECONDARY_HEIGHT}
    borderRadius={DEFAULT_BORDER_RADIUS}
  />;
}

function skeletonActivityLine(width: number = null) {
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

    <SkeletonPlaceholder.Item
      marginTop={UNIT * 4}
      width={300}
      height={HEIGHT}
      borderRadius={DEFAULT_BORDER_RADIUS}
    />

    <SkeletonPlaceholder.Item
      marginTop={UNIT * 3}
      width={320}
      height={120}
      borderRadius={DEFAULT_BORDER_RADIUS}
    />

  </SkeletonPlaceholder>;
};
export const SkeletonIssueCustomFields = () => {
  const props = {
    width: 90,
    height: 36,
    borderRadius: DEFAULT_BORDER_RADIUS,
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
        {Array(4).fill(0).map((it, index) => <SkeletonPlaceholder.Item
          key={`skeletonCustomField-${index}`} {...props}/>)}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
export const SkeletonIssueInfoLine = (props: {lines?: number}) => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item
        flexDirection='column'
      >
        {Array(props.lines || 1).fill(0).map((it, index) =>
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

export function skeletonIssueActivity(marginTop: number = 0, key: string) {
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

export const SkeletonIssueActivities = () => {
  return <SkeletonPlaceholder
    {...skeletonPlaceholderDefaultProps}
  >
    {[0, UNIT * 2, UNIT * 3].map(((marginTop: number, index) => skeletonIssueActivity(marginTop, `activity-${index}`)))}
  </SkeletonPlaceholder>;
};
