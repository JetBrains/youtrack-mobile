import React from 'react';

import type {ImageItemConfig} from 'react-native-ios-utilities';
import type {IconConfig} from 'react-native-ios-context-menu/src/types/MenuIconConfig';
import type {MenuConfig, MenuActionConfig} from 'react-native-ios-context-menu/src/types/MenuConfig';

export interface ContextMenuConfigItem extends MenuActionConfig {
  execute: () => any;
  icon?: IconConfig | (ImageItemConfig & {svg?: string});
  svg?: () => React.FC<React.SVGAttributes<SVGElement>>;
  startBlock?: boolean;
}

export interface ContextMenuConfig extends MenuConfig {
  menuItems: ContextMenuConfigItem[];
}
