import React, {PureComponent} from 'react';

import IconFA from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconVCS from '@jetbrains/icons/pr-merged.svg';

import EStyleSheet from 'react-native-extended-stylesheet';

import {isAndroidPlatform} from '../../util/util';

import IconYTM from './youtrack-icon';

export {default as logo} from './youtrack-logo-512.png';


type Props = {
  name?: string,
  size?: number,
  color?: string,
  isFontAwesome?: boolean
};

const isAndroid = isAndroidPlatform();

const defaultProps = () => ({
  name: '',
  size: 26,
  color: EStyleSheet.value('$link'),
  isFontAwesome: false,
});

class DefaultIcon extends PureComponent<Props, void> {
  static defaultProps: Props = defaultProps;

  render() {
    if (!this.props.name) {
      return null;
    }
    const Icon = this.props.isFontAwesome ? IconFA : IconMaterial;
    return <Icon {...this.props}/>;
  }
}

/* Main menu icons */

export const IconAccountAlert = (props?: Props) => <DefaultIcon {...{
  name: 'account-alert',
  ...props,
}} />;

/* Material icons */

export const IconMagnify = (props?: Props) => <DefaultIcon {...{
  name: 'magnify',
  ...props,
}} />;

export const IconMagnifyZoom = (props?: Props & {zoomedIn?: boolean}) => <DefaultIcon {...{
  name: props.zoomedIn ? 'magnify-minus-outline' : 'magnify-plus-outline',
  ...props,
}} />;

export const IconLogout = (props?: Props) => <DefaultIcon {...{
  name: 'logout',
  ...props,
}} />;

export const IconLock = (props?: Props) => <DefaultIcon {...{
  name: 'lock',
  ...props,
}} />;

export const IconArrowUp = (props?: Props) => <DefaultIcon {...{
  name: 'arrow-up',
  ...props,
}} />;

export const IconPlus = (props?: Props) => <DefaultIcon {...{
  name: 'plus',
  ...props,
}} />;

export const IconActions = (props?: Props) => <DefaultIcon {...{
  name: 'dots-horizontal',
  ...props,
}} />;

export const IconThumbUp = (props?: Props & { isActive?: boolean }) => <DefaultIcon {...{
  name: props.isActive ? 'thumb-up' : 'thumb-up-outline',
  ...props,
}} />;

export const IconBookmark = (props?: Props) => <DefaultIcon {...{
  name: 'bookmark',
  ...props,
}} />;


/* FontAwesome icons */

export const EllipsisVertical = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'ellipsis-v',
  ...props,
}} />;

export const IconAngleRight = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'angle-right',
  ...props,
}} />;

export const IconCamera = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'camera',
  ...props,
}} />;

export const IconCheckboxBlank = (props?: Props) => <DefaultIcon {...{
  name: 'checkbox-blank-outline',
  ...props,
}} />;

export const IconCheckboxChecked = (props?: Props) => <DefaultIcon {...{
  name: 'checkbox-marked',
  ...props,
}} />;

export const IconClone = (props?: Props) => <DefaultIcon {...{
  isFontAwesome: true,
  name: 'clone',
  ...props,
}} />;

// JetBrains RingUI custom icons

export const IconAdd = (props?: Props) => <IconYTM {...{
  name: 'add',
  ...props,
}} />;

export const IconAngleDown = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'chevron-down',
  ...props,
}} />;

export const IconAngleDownRight = (props?: Props & { isDown?: boolean }) => <IconYTM {...{
  ...defaultProps(),
  name: props.isDown ? 'chevron-down' : 'chevron-right',
  ...props,
}}/>;

export const IconChevronDownUp = (props?: Props & { isDown?: boolean }) => <IconYTM {...{
  ...defaultProps(),
  name: props.isDown ? 'chevron-down' : 'chevron-up',
  ...props,
}}/>;

export const IconCaretDownUp = (props?: Props & { isDown?: boolean }) => <DefaultIcon {...{
  name: props.isDown ? 'caret-down' : 'caret-up',
  isFontAwesome: true,
  ...props,
}}/>;

export const IconAttachment = (props?: Props) => <IconYTM {...{
  name: 'attachment',
  ...props,
}} />;


export const IconBack = (props?: Props) => {
  if (isAndroid) {
    return <DefaultIcon {...{
      name: 'arrow-left',
      size: 24,
      ...props,
    }} />;
  }
  return <IconYTM {...{
    ...defaultProps(),
    name: 'chevron-left',
    size: 30,
    ...props,
  }} />;
};

export const IconContextActions = (props?: Props) => {
  if (isAndroid) {
    return <IconYTM {...{
      ...defaultProps(),
      name: 'drag',
      size: 18,
      ...props,
    }} />;
  }
  return <IconYTM {...{
    ...defaultProps(),
    name: 'more-options',
    size: 18,
    ...props,
  }} />;
};

export const IconBell = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'bell-filled',
  ...props,
}} />;

export const IconBoard = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'board',
  ...props,
}} />;

export const IconCheck = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'checkmark',
  ...props,
}} />;

export const IconClose = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'close',
  ...props,
}} />;

export const IconComment = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'comment',
  ...props,
}} />;

export const IconDrag = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'drag',
  ...props,
}} />;

export const IconException = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'exception',
  ...props,
}} />;

export const IconHistory = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'history',
  ...props,
}} />;

export const IconHourGlass = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'hourglass',
  ...props,
}} />;

export const IconKnowledgeBase = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'knowledge-base',
  ...props,
}} />;

export const IconMoreOptions = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'more-options',
  ...props,
}} />;

export const IconPencil = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'pencil',
  ...props,
}} />;

export const IconRemoveFilled = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'remove-filled',
  ...props,
}} />;

export const IconTask = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'task',
  ...props,
}} />;

export const IconSearch = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'search',
  ...props,
}} />;

export const IconSettings = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'settings-20px',
  ...props,
}} />;

export const IconStar = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'star-filled',
  ...props,
}} />;

export const IconStarOutline = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'star-empty',
  ...props,
}} />;

export const IconWork = (props?: Props) => <IconYTM {...{
  ...defaultProps(),
  name: 'hourglass-20px',
  ...props,
}} />;

export const IconVcs = (props?: Props) => (
  <IconVCS
    style={{
      transform: [
        {scaleY: -1},
      ],
    }}
    fill={props.color || defaultProps().color}
    width={props.size || 22}
    height={props.size || 22}
  />
);
