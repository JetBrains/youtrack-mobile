import React from 'react';

import EStyleSheet from 'react-native-extended-stylesheet';
// @ts-ignore
import IconFA from 'react-native-vector-icons/FontAwesome';
// @ts-ignore
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

import ChevronSmallDown from 'components/icon/assets/shevron_small_down.svg';
import ChevronSmallUp from 'components/icon/assets/shevron_small_up.svg';
import IconMore from 'components/icon/assets/more.svg';
import IconVCS from '@jetbrains/icons/pr-merged.svg';
import IconYTM from './youtrack-icon';
import Lock from 'components/icon/assets/lock.svg';
import {isAndroidPlatform} from 'util/util';

import {TextStyleProp} from 'types/Internal';

// @ts-ignore
export {default as logo} from './youtrack-logo-512.png';

import styles from './icon.styles';

type IconStyle = TextStyleProp | TextStyleProp[];

interface SVGIconProps {
  size?: number;
  color?: string;
  style?: IconStyle;
  testID?: string;
}

interface Props {
  name?: string;
  size?: number;
  color?: string;
  isFontAwesome?: boolean;
  style?: IconStyle;
  testID?: string;
}

const isAndroid = isAndroidPlatform();

const svgProps = () => ({
  size: 24,
  color: EStyleSheet.value('$link'),
});

const defaultProps = () => ({
  ...svgProps(),
  name: '',
  size: 26,
  isFontAwesome: false,
});

export function IconFont(props: Props): React.JSX.Element | null {
  if (!props.name) {
    return null;
  }

  const Icon = props.isFontAwesome ? IconFA : IconMaterial;
  return <Icon {...{...defaultProps(), ...props}} />;
}

/* Main menu icons */

export const IconAccountAlert = (props?: Props) => (
  <IconFont
    {...{
      name: 'account-alert',
      ...props,
    }}
  />
);

const mergeStyles = (style: any = []): any => {
  return [].concat(style);
};

/* Material icons */
export const IconLock = (props?: Props) => {
  const color = props?.color || svgProps().color;
  const size = props?.size || 16;
  return <Lock style={mergeStyles(props?.style)} width={size} height={size} color={color} />;
};
export const IconArrowUp = (props?: Props) => (
  <IconFont
    {...{
      name: 'arrow-up',
      ...props,
    }}
  />
);
export const IconShare = (props?: Props) => (
  <IconFont
    {...{
      name: 'export-variant',
      ...props,
    }}
  />
);
export const IconCircle = (props?: Props) => (
  <IconFont
    {...{
      name: 'circle',
      ...props,
    }}
  />
);
export const IconCircleOutline = (props?: Props) => (
  <IconFont
    {...{
      name: 'checkbox-blank-circle-outline',
      ...props,
    }}
  />
);

/* FontAwesome icons */
export const IconFileText = (props?: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'file-text-o',
      ...props,
    }}
  />
);

export const EllipsisVertical = (props?: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'ellipsis-v',
      ...props,
    }}
  />
);
export const IconAngleRight = (props?: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'angle-right',
      ...props,
    }}
  />
);
export const IconCamera = (props?: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'camera',
      ...props,
    }}
  />
);
export const IconCheckboxBlank = (props?: Props) => (
  <IconFont
    {...{
      name: 'checkbox-blank-outline',
      ...props,
    }}
  />
);
export const IconCheckboxChecked = (props?: Props) => (
  <IconFont
    {...{
      name: 'checkbox-marked',
      ...props,
    }}
  />
);
export const IconFileCheck = (props?: Props) => (
  <IconFont
    {...{
      name: 'file-check-outline',
      ...props,
    }}
  />
);
export const IconClone = (props?: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'clone',
      ...props,
    }}
  />
);
// JetBrains RingUI custom icons
export const IconAdd = (props?: Props) => (
  <IconYTM
    {...{
      name: 'add',
      ...props,
    }}
  />
);
export const IconAngleDown = (props?: Props) => {
  const color = props?.color || svgProps().color;
  const size = props?.size || 18;
  return <ChevronSmallDown style={mergeStyles(props?.style)} width={size} height={size} color={color} />;
};

export const IconAngleUp = (props?: Props) => {
  const color = props?.color || defaultProps().color;
  const size = props?.size || 18;
  return <ChevronSmallUp style={mergeStyles(props?.style)} width={size} height={size} color={color} />;
};
export const IconAngleDownRight = (props?: Props & {isDown?: boolean}) => (
  <IconYTM
    {...{
      ...defaultProps(),
      name: props?.isDown ? 'chevron-down' : 'chevron-right',
      ...props,
    }}
  />
);
export const IconChevronDownUp = (props?: Props & {isDown?: boolean}) => {
  return props?.isDown ? IconAngleDown(props) : IconAngleUp(props);
};
export const IconBack = (props?: Props) => {
  if (isAndroid) {
    return (
      <IconFont
        {...{
          name: 'arrow-left',
          size: 24,
          ...props,
        }}
      />
    );
  }

  return <IconYTM {...{...defaultProps(), name: 'chevron-left', size: 32, ...props}} />;
};
export const IconContextActions = (props?: Props) => {
  if (isAndroid) {
    return <IconYTM {...{...defaultProps(), name: 'drag', size: 18, ...props}} />;
  }

  return <IconYTM {...{...defaultProps(), name: 'more-options', size: 18, ...props}} />;
};
export const IconCheck = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'checkmark', ...props}} />;
export const IconClose = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'close', ...props}} />;
export const IconComment = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'comment', ...props}} />;
export const IconDrag = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'drag', ...props}} />;
export const IconException = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'exception', ...props}} />;
export const IconHistory = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'history', ...props}} />;
export const IconHourGlass = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'hourglass', ...props}} />;
export const IconKnowledgeBase = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'knowledge-base', ...props}} />
);
export const IconMoreOptions = (props?: SVGIconProps) => {
  const color = props?.color || defaultProps().color;
  const size = props?.size || 18;
  return (
    <IconMore
      style={mergeStyles(props?.style).concat(isAndroid ? styles.iconMoreOptionsAndroid : [])}
      width={size}
      height={size}
      color={color}
    />
  );
};
export const IconPencil = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'pencil', ...props}} />;
export const IconRemoveFilled = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'remove-filled', ...props}} />
);
export const IconWork = (props?: Props) => <IconYTM {...{...defaultProps(), name: 'hourglass-20px', ...props}} />;
export const IconVcs = (props?: Props) => {
  const size = props?.size || 22;
  return (
    <IconVCS style={{transform: [{scaleY: -1}]}} fill={props?.color || svgProps().color} width={size} height={size} />
  );
};
