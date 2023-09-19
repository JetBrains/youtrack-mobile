import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {agileCard} from '../agile-card/agile-card.styles';
import {getAgileCardHeight} from '../agile-card/agile-card';
import {UNIT} from 'components/variables';
type SkeletonProps = {
  flex?: number;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  key?: string;
  speed?: number;
  shimmerWidth?: number;
};
export const SKELETON_WIDTH: number = 100;
export const SKELETON_HEIGHT: number = 20;
export const SKELETON_SECONDARY_HEIGHT: number = 14;
export const SKELETON_DEFAULT_BORDER_RADIUS: number = UNIT / 2;
const cv: number = 200;
export const skeletonPlaceholderDefaultProps = {
  backgroundColor: `rgba(${cv},${cv},${cv},${0.3})`,
  highlightColor: `rgba(${cv},${cv},${cv},${1})`,
  speed: 1200,
};
const defaultSkeletonProps: SkeletonProps = {
  width: SKELETON_WIDTH,
  height: SKELETON_HEIGHT,
  borderRadius: SKELETON_DEFAULT_BORDER_RADIUS,
};
export const Skeleton = (props: SkeletonProps): JSX.Element => {
  const {speed, shimmerWidth, ...rest} = props;
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps} speed={speed} shimmerWidth={shimmerWidth}>
      <SkeletonPlaceholder.Item {...defaultSkeletonProps} {...rest} />
    </SkeletonPlaceholder>
  );
};
export const SkeletonSecondaryLine = (props: SkeletonProps): JSX.Element => {
  return (
    <SkeletonPlaceholder.Item
      {...defaultSkeletonProps}
      width={props.width || '100%'}
      height={SKELETON_SECONDARY_HEIGHT}
      {...props}
    />
  );
};
export const SkeletonLine = (props: SkeletonProps): JSX.Element => {
  return (
    <SkeletonPlaceholder.Item
      {...defaultSkeletonProps}
      width={'100%'}
      height={SKELETON_HEIGHT}
      {...props}
    />
  );
};
export const SkeletonList = (props: SkeletonProps): JSX.Element => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps} {...props}>
      <SkeletonPlaceholder.Item
        flexDirection="column"
        marginLeft={UNIT * 2}
        marginRight={UNIT * 2}
      >
        {Array(6)
          .fill(0)
          .map((marginTop: number, index) =>
            SkeletonLine({
              key: `${index}`,
              height: SKELETON_HEIGHT * 1.5,
              marginTop: UNIT * 2.5,
            }),
          )}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

function skeletonUserInfo() {
  return (
    <SkeletonPlaceholder.Item flexGrow={1}>
      <SkeletonPlaceholder.Item
        width={140}
        height={SKELETON_HEIGHT}
        marginLeft={UNIT}
        borderRadius={SKELETON_DEFAULT_BORDER_RADIUS}
      />
    </SkeletonPlaceholder.Item>
  );
}

function skeletonDate() {
  return (
    <SkeletonPlaceholder.Item
      width={80}
      height={SKELETON_SECONDARY_HEIGHT}
      borderRadius={SKELETON_DEFAULT_BORDER_RADIUS}
    />
  );
}

function skeletonActivityLine(width?: number) {
  return SkeletonSecondaryLine({
    width: width,
    marginLeft: UNIT * 6,
    marginTop: UNIT,
  });
}

export const SkeletonIssueContent = (): JSX.Element => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <>
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
      </>
    </SkeletonPlaceholder>
  );
};
export const SkeletonIssueCustomFields = (): JSX.Element => {
  const props = {
    width: 90,
    height: 36,
    borderRadius: SKELETON_DEFAULT_BORDER_RADIUS,
    marginTop: UNIT / 2,
    marginLeft: UNIT,
    marginRight: UNIT,
  };
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item
        flexDirection="row"
        justifyContent="space-between"
        marginTop={UNIT * 3}
      >
        {Array(4)
          .fill(0)
          .map((it: number, index: number) => (
            <SkeletonPlaceholder.Item
              key={`skeletonCustomField-${index}`}
              {...props}
            />
          ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
export const SkeletonIssueInfoLine = (props: {lines?: number}): JSX.Element => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item flexDirection="column">
        {Array(props.lines || 1)
          .fill(0)
          .map((it: number, index: number) =>
            SkeletonSecondaryLine({
              key: `issueAddInfo-${index}`,
              width: 200,
              marginTop: UNIT,
            }),
          )}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

function skeletonAvatar() {
  return <SkeletonPlaceholder.Item width={32} height={32} borderRadius={3} />;
}

function skeletonIssueActivity(marginTop: number = 0, key: string) {
  return (
    <SkeletonPlaceholder.Item
      key={key}
      marginTop={marginTop}
      marginRight={UNIT}
    >
      <SkeletonPlaceholder.Item
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
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

export const SkeletonIssueActivities = (props?: SkeletonProps): JSX.Element => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item {...props}>
        {[0, UNIT * 2, UNIT * 3].map((marginTop: number, index: number) =>
          skeletonIssueActivity(marginTop, `activity-${index}`),
        )}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

function skeletonIssue(key: string) {
  return (
    <SkeletonPlaceholder.Item key={key} marginBottom={UNIT * 2}>
      {SkeletonLine({
        width: 80,
        marginTop: UNIT,
        borderRadius: 10,
        height: SKELETON_HEIGHT,
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
        height: SKELETON_HEIGHT,
      })}
    </SkeletonPlaceholder.Item>
  );
}

export const SkeletonIssues = (props: SkeletonProps): JSX.Element => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item
        {...props}
        flexDirection="column"
        marginLeft={UNIT * 2}
        marginRight={UNIT * 2}
      >
        {Array(5)
          .fill(0)
          .map((_: number, index) =>
            skeletonIssue(`skeletonIssues-${index}`),
          )}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

export const SkeletonIssuesS = (props: SkeletonProps): JSX.Element => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item
        {...props}
        flexDirection="column"
        marginLeft={UNIT * 2}
        marginRight={UNIT * 2}
        marginTop={UNIT * 1.5}
      >
        {Array(14)
          .fill(0)
          .map((_: number, index) => {
            return <SkeletonPlaceholder.Item
              key={`skeletonIssues-${index}`}
              flexDirection="row"
              marginBottom={UNIT * 2.3}
              width="100%"
            >
              {SkeletonSecondaryLine({
                width: 4,
                marginRight: UNIT,
                borderRadius: 10,
                height: SKELETON_HEIGHT,
              })}
              {SkeletonSecondaryLine({
                flex: 1,
                borderRadius: 0,
                height: SKELETON_HEIGHT,
              })}
              {SkeletonSecondaryLine({
                width: SKELETON_HEIGHT,
                marginLeft: UNIT,
                marginRight: -UNIT / 2,
                borderRadius: SKELETON_HEIGHT,
                height: SKELETON_HEIGHT,
              })}
            </SkeletonPlaceholder.Item>;
            },
          )}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

function skeletonCard(key: string): JSX.Element {
  return (
    <SkeletonPlaceholder.Item key={key} marginTop={UNIT * 1.5}>
      {SkeletonLine({
        width: SKELETON_WIDTH * 3,
        height: getAgileCardHeight(),
        borderRadius: agileCard.borderRadius,
      })}
    </SkeletonPlaceholder.Item>
  );
}

export const SkeletonAgile = (props: SkeletonProps): JSX.Element => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps} {...props}>
      <SkeletonPlaceholder.Item
        flexDirection="column"
        marginLeft={UNIT * 2}
        marginRight={UNIT * 2}
      >
        {SkeletonLine({
          height: SKELETON_HEIGHT,
          marginTop: UNIT * 2,
          borderRadius: 0,
        })}

        {SkeletonLine({
          height: SKELETON_HEIGHT * 2.5,
          marginTop: UNIT * 1.5,
        })}

        {SkeletonLine({
          height: SKELETON_HEIGHT,
          marginTop: UNIT * 1.5,
          borderRadius: 0,
        })}
        {SkeletonLine({
          height: SKELETON_HEIGHT * 2,
          marginTop: UNIT * 3,
          marginBottom: UNIT * 2,
          borderRadius: 0,
        })}
        <>
          {Array(3).fill(0).map((marginTop: number, index) =>
            skeletonCard(`skeletonCard-${index}`),
          )}
        </>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
export const SkeletonCreateArticle = (): JSX.Element => {
  return (
    <SkeletonPlaceholder {...skeletonPlaceholderDefaultProps}>
      <SkeletonPlaceholder.Item flexDirection="column">
        {SkeletonLine({
          width: SKELETON_WIDTH * 1.5,
          height: SKELETON_HEIGHT,
          marginTop: UNIT * 2.5,
        })}

        {SkeletonLine({
          width: SKELETON_WIDTH * 2.5,
          height: SKELETON_HEIGHT,
          marginTop: UNIT * 2.5,
        })}

        {SkeletonLine({
          height: SKELETON_HEIGHT * 2,
          marginTop: UNIT * 4,
          marginBottom: UNIT * 2,
        })}

        {SkeletonLine({
          height: SKELETON_HEIGHT * 5,
        })}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
