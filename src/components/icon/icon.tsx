import React from 'react';

import EStyleSheet from 'react-native-extended-stylesheet';
import IconFA from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconVCS from '@jetbrains/icons/pr-merged.svg';

import IconYTM from './youtrack-icon';
import {isAndroidPlatform} from 'util/util';

export {default as logo} from './youtrack-logo-512.png';

type Props = {
  name?: string;
  size?: number;
  color?: string;
  isFontAwesome?: boolean;
  style?: Record<string, string> | Record<string, string>[];
};
const isAndroid = isAndroidPlatform();

const defaultProps = () => ({
  name: '',
  size: 26,
  color: EStyleSheet.value('$link'),
  isFontAwesome: false,
});

export function IconFont(props: Props): JSX.Element | null {
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

/* Material icons */
export const IconMagnify = (props?: Props) => (
  <IconFont
    {...{
      name: 'magnify',
      ...props,
    }}
  />
);
export const IconMagnifyZoom = (
  props?: Props & {
    zoomedIn?: boolean;
  },
) => (
  <IconFont
    {...{
      name: props.zoomedIn ? 'magnify-minus-outline' : 'magnify-plus-outline',
      ...props,
    }}
  />
);
export const IconLogout = (props?: Props) => (
  <IconFont
    {...{
      name: 'logout',
      ...props,
    }}
  />
);
export const IconLock = (props?: Props) => (
  <IconFont
    {...{
      name: 'lock',
      ...props,
    }}
  />
);
export const IconArrowUp = (props?: Props) => (
  <IconFont
    {...{
      name: 'arrow-up',
      ...props,
    }}
  />
);
export const IconPlus = (props?: Props) => (
  <IconFont
    {...{
      name: 'plus',
      ...props,
    }}
  />
);
export const IconActions = (props?: Props) => (
  <IconFont
    {...{
      name: 'dots-horizontal',
      ...props,
    }}
  />
);
export const IconThumbUp = (
  props?: Props & {
    isActive?: boolean;
  },
) => (
  <IconFont
    {...{
      name: props.isActive ? 'thumb-up' : 'thumb-up-outline',
      ...props,
    }}
  />
);
export const IconBookmark = (props?: Props) => (
  <IconFont
    {...{
      name: 'bookmark',
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
export const IconStar = (props?: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'star',
      ...props,
    }}
  />
);
export const IconStarOutline = (props?: Props) => (
  <IconFont
    {...{
      isFontAwesome: true,
      name: 'star-o',
      ...props,
    }}
  />
);
export const IconSettings = (props?: Props) => (
  <IconFont
    {...{
      name: 'cog-outline',
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
export const IconAngleDown = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'chevron-down', ...props}} />
);
export const IconAngleDownRight = (
  props?: Props & {
    isDown?: boolean;
  },
) => (
  <IconYTM
    {...{
      ...defaultProps(),
      name: props.isDown ? 'chevron-down' : 'chevron-right',
      ...props,
    }}
  />
);
export const IconChevronDownUp = (
  props?: Props & {
    isDown?: boolean;
  },
) => (
  <IconYTM
    {...{
      ...defaultProps(),
      name: props.isDown ? 'chevron-down' : 'chevron-up',
      ...props,
    }}
  />
);
export const IconCaretDownUp = (
  props?: Props & {
    isDown?: boolean;
  },
) => (
  <IconFont
    {...{
      name: props.isDown ? 'caret-down' : 'caret-up',
      isFontAwesome: true,
      ...props,
    }}
  />
);

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

  return (
    <IconYTM
      {...{...defaultProps(), name: 'chevron-left', size: 30, ...props}}
    />
  );
};
export const IconContextActions = (props?: Props) => {
  if (isAndroid) {
    return (
      <IconYTM {...{...defaultProps(), name: 'drag', size: 18, ...props}} />
    );
  }

  return (
    <IconYTM
      {...{...defaultProps(), name: 'more-options', size: 18, ...props}}
    />
  );
};
export const IconBell = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'bell-filled', ...props}} />
);
export const IconBoard = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'board', ...props}} />
);
export const IconCheck = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'checkmark', ...props}} />
);
export const IconClose = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'close', ...props}} />
);
export const IconComment = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'comment', ...props}} />
);
export const IconDrag = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'drag', ...props}} />
);
export const IconException = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'exception', ...props}} />
);
export const IconHistory = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'history', ...props}} />
);
export const IconHourGlass = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'hourglass', ...props}} />
);
export const IconKnowledgeBase = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'knowledge-base', ...props}} />
);
export const IconMoreOptions = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'more-options', ...props}} />
);
export const IconPencil = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'pencil', ...props}} />
);
export const IconRemoveFilled = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'remove-filled', ...props}} />
);
export const IconTask = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'task', ...props}} />
);
export const IconSearch = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'search', ...props}} />
);
export const IconSettingsTab = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'settings-20px', ...props}} />
);
export const IconStar_ = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'star-filled', ...props}} />
);
export const IconStarOutline_ = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'star-empty', ...props}} />
);
export const IconWork = (props?: Props) => (
  <IconYTM {...{...defaultProps(), name: 'hourglass-20px', ...props}} />
);
export const IconVcs = (props?: Props) => (
  <IconVCS
    style={{
      transform: [
        {
          scaleY: -1,
        },
      ],
    }}
    fill={props.color || defaultProps().color}
    width={props.size || 22}
    height={props.size || 22}
  />
);
