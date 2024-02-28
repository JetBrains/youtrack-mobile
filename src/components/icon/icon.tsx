import React from 'react';

import EStyleSheet from 'react-native-extended-stylesheet';
// @ts-ignore
import IconFA from 'react-native-vector-icons/FontAwesome';
// @ts-ignore
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

import ArrowLeft from '@jetbrains/icons/arrow-20px-left.svg';
import Checkmark from 'components/icon/assets/checkmark.svg';
import ChevronLeft from 'components/icon/assets/shevron_left.svg';
import ChevronSmallDown from 'components/icon/assets/shevron_small_down.svg';
import ChevronSmallUp from 'components/icon/assets/shevron_small_up.svg';
import Comment from 'components/icon/assets/comment.svg';
import Drag from '@jetbrains/icons/drag-20px.svg';
import History from 'components/icon/assets/history.svg';
import Lock from 'components/icon/assets/lock.svg';
import More from 'components/icon/assets/more.svg';
import Plus from 'components/icon/assets/plus.svg';
import Time from 'components/icon/assets/time.svg';
import Vcs from 'components/icon/assets/vcs.svg';
import Vote from 'components/icon/assets/vote.svg';
import IconYTM from './youtrack-icon';
import {isAndroidPlatform} from 'util/util';

import {TextStyleProp} from 'types/Internal';

// @ts-ignore
export {default as logo} from './youtrack-logo-512.png';

import styles, {rotate45} from './icon.styles';

type IconStyle = TextStyleProp | TextStyleProp[];

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

export const IconAccountAlert = (props: Props) => (
  <IconFont
    {...{
      name: 'account-alert',
      ...props,
    }}
  />
);

const mergeStyles = (style: IconStyle = [], extraStyle: IconStyle = []): IconStyle[] => {
  return new Array<IconStyle>().concat(style).concat(extraStyle);
};

export const IconArrowUp = (props: Props) => (
  <IconFont
    {...{
      name: 'arrow-up',
      ...props,
    }}
  />
);

export const IconShare = (props: Props) => (
  <IconFont
    {...{
      name: 'export-variant',
      ...props,
    }}
  />
);

export const IconCircle = (props: Props) => (
  <IconFont
    {...{
      name: 'circle',
      ...props,
    }}
  />
);

export const IconCircleOutline = (props: Props) => (
  <IconFont
    {...{
      name: 'checkbox-blank-circle-outline',
      ...props,
    }}
  />
);

export const IconFileText = (props: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'file-text-o',
      ...props,
    }}
  />
);

export const IconAngleRight = (props: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'angle-right',
      ...props,
    }}
  />
);

export const IconCamera = (props: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'camera',
      ...props,
    }}
  />
);

export const IconCheckboxBlank = (props: Props) => (
  <IconFont
    {...{
      name: 'checkbox-blank-outline',
      ...props,
    }}
  />
);

export const IconCheckboxChecked = (props: Props) => (
  <IconFont
    {...{
      name: 'checkbox-marked',
      ...props,
    }}
  />
);

export const IconFileCheck = (props: Props) => (
  <IconFont
    {...{
      name: 'file-check-outline',
      ...props,
    }}
  />
);

export const IconClone = (props: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'clone',
      ...props,
    }}
  />
);

export const IconAngleDownRight = (props: Props & {isDown?: boolean}) => (
  <IconYTM
    {...{
      ...defaultProps(),
      name: props?.isDown ? 'chevron-down' : 'chevron-right',
      ...props,
    }}
  />
);

export const IconPencil = (props: Props) => <IconYTM {...{...defaultProps(), name: 'pencil', ...props}} />;

export const IconRemoveFilled = (props: Props) => <IconYTM {...{...defaultProps(), name: 'remove-filled', ...props}} />;

export const IconWork = (props: Props) => <IconYTM {...{...defaultProps(), name: 'hourglass-20px', ...props}} />;

export const IconException = (props: Props) => <IconYTM {...{...defaultProps(), name: 'exception', ...props}} />;

/*
  SVG icons
 */

const createSVGProps = (
  props: Props,
  defaultSize: number,
  style?: IconStyle
): {
  [key: string]: string | number | IconStyle[];
} => {
  const color = props?.color || svgProps().color;
  const size = props?.size || defaultSize;
  return {color, width: size, height: size, style: mergeStyles(props?.style, style)};
};

export const IconLock = (props: Props) => <Lock {...createSVGProps(props, 16)} />;

export const IconAdd = (props: Props, style: IconStyle) => <Plus {...createSVGProps(props, 26, style)} />;

export const IconAngleDown = (props: Props) => <ChevronSmallDown {...createSVGProps(props, 18)} />;

export const IconAngleUp = (props: Props) => <ChevronSmallUp {...createSVGProps(props, 18)} />;

export const IconChevronDownUp = (props: Props & {isDown?: boolean}) => {
  return props?.isDown ? IconAngleDown(props) : IconAngleUp(props);
};

export const IconBack = (props: Props) =>
  isAndroid ? <ArrowLeft {...createSVGProps(props, 23)} /> : <ChevronLeft {...createSVGProps(props, 25)} />;

export const IconCheck = (props: Props) => <Checkmark {...createSVGProps(props, 24)} />;

export const IconClose = (props: Props) => IconAdd(props, rotate45);

export const IconComment = (props: Props) => <Comment {...createSVGProps(props, 24)} />;

export const IconHistory = (props: Props) => <History {...createSVGProps(props, 24)} />;

export const IconHourGlass = (props: Props) => <Time {...createSVGProps(props, 24)} />;

export const IconMoreOptions = (props: Props) =>
  <More {...createSVGProps(props, 19, isAndroid ? styles.iconMoreOptionsAndroid : [])} />;

export const EllipsisVertical = (props: Props) => <Drag {...createSVGProps(props, 18)} />;

export const IconVcs = (props: Props) => <Vcs {...createSVGProps(props, 24)} />;

export const IconVote = (props: Props) => <Vote {...createSVGProps(props, 19)} />;
